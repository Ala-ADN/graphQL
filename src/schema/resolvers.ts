import { Resolver, Query, Mutation, Arg, Subscription, Root, Ctx } from 'type-graphql';
import { Cv, CvInput, CvChange, } from './typeDefs';
import { MutationType } from '../types';
import { Context } from '../context';
const CV_CHANGED = 'CV_CHANGED';

@Resolver(() => Cv)
export class CvResolver {
  @Query(() => [Cv])
  async cvs(@Ctx() ctx: Context) {
    return ctx.prisma.cv.findMany({
      include: { user: true, skills: true },
    });
  }

  @Query(() => Cv, { nullable: true })
  async cv(@Arg('id') id: string, @Ctx() ctx: Context) {
    return ctx.prisma.cv.findUnique({
      where: { id },
      include: { user: true, skills: true },
    });
  }

  @Mutation(() => Cv)
  async addCv(
    @Arg('input') input: CvInput,
    @Ctx() { prisma, pubsub }: Context
  ) {
    const { userId, skillIds, ...rest } = input;
    const newCv = await prisma.cv.create({
      data: {
        ...rest,
        userId,
        skills: {
          connect: skillIds.map(id => ({ id }))
        }
      },
      include: { user: true, skills: true },
    });

    await pubsub.publish(CV_CHANGED, { 
      cvChanged: { mutation: MutationType.CREATED, cv: newCv } 
    });
    return newCv;
  }

  @Mutation(() => Cv, { nullable: true })
  async updateCv(
    @Arg('id') id: string,
    @Arg('input') input: CvInput,
    @Ctx() { prisma, pubsub }: Context
  ) {
    try {
      const { userId, skillIds, ...rest } = input;
      const updatedCv = await prisma.cv.update({
        where: { id },
        data: {
          ...rest,
          userId,
          skills: {
            set: skillIds.map(id => ({ id }))
          }
        },
        include: { user: true, skills: true },
      });

      await pubsub.publish(CV_CHANGED, { 
        cvChanged: { mutation: MutationType.UPDATED, cv: updatedCv } 
      });
      return updatedCv;
    } catch {
      return null;
    }
  }

  @Mutation(() => Boolean)
  async deleteCv(
    @Arg('id') id: string,
    @Ctx() { prisma, pubsub }: Context
  ) {
    try {
      const deletedCv = await prisma.cv.delete({
        where: { id },
        include: { user: true, skills: true },
      });

      await pubsub.publish(CV_CHANGED, { 
        cvChanged: { mutation: MutationType.DELETED, cv: deletedCv } 
      });
      return true;
    } catch {
      return false;
    }
  }

  @Subscription(() => CvChange, { topics: CV_CHANGED })
  cvChanged(@Root() payload: { cvChanged: CvChange }): CvChange {
    return payload.cvChanged;
  }
}