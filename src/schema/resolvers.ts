import { Resolver, Query, Mutation, Arg, Subscription, Root, Ctx } from 'type-graphql';
import { Cv, CvInput,CvUpdateInput, CvChange, } from './typeDefs';
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
  ): Promise<Cv> {
    // 1. verify user exists
    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) {
      throw new Error(`User id="${input.userId}" introuvable`);
    }

    // 2. verify each skill exists
    for (const skillId of input.skillIds) {
      const skill = await prisma.skill.findUnique({ where: { id: skillId } });
      if (!skill) {
        throw new Error(`Skill id="${skillId}" introuvable`);
      }
    }

    // 3. create CV
    const newCv = await prisma.cv.create({
      data: {
        name:   input.name,
        age:    input.age,
        job:    input.job,
        userId: input.userId,
        skills: {
          connect: input.skillIds.map(id => ({ id })),
        },
      },
      include: { user: true, skills: true },
    });

    // 4. publish creation event
    await pubsub.publish(CV_CHANGED, {
      cvChanged: { mutation: MutationType.CREATED, cv: newCv },
    });

    return newCv;
  }

  @Mutation(() => Cv, { nullable: true })
  async updateCv(
    @Arg('input') input: CvUpdateInput,
    @Ctx() { prisma, pubsub }: Context
  ): Promise<Cv | null> {
    const existing = await prisma.cv.findUnique({
      where: { id: input.id }
    });
    if (!existing) {
      return null;
    }

    
    if (input.userId) {
      const user = await prisma.user.findUnique({ where: { id: input.userId } });
      if (!user) {
        throw new Error(`User id="${input.userId}" introuvable`);
      }
    }

    
    if (input.skillIds) {
      for (const skillId of input.skillIds) {
        const skill = await prisma.skill.findUnique({ where: { id: skillId } });
        if (!skill) {
          throw new Error(`Skill id="${skillId}" introuvable`);
        }
      }
    }


    const updatedCv = await prisma.cv.update({
      where: { id: input.id },
      data: {

        ...(input.name     !== undefined && { name:   input.name     }),
        ...(input.age      !== undefined && { age:    input.age      }),
        ...(input.job      !== undefined && { job:    input.job      }),
        ...(input.userId   !== undefined && { userId: input.userId   }),
        ...(input.skillIds !== undefined && {
          skills: {
            set: input.skillIds.map(id => ({ id }))
          }
        }),
      },
      include: { user: true, skills: true },
    });


    await pubsub.publish(CV_CHANGED, {
      cvChanged: { mutation: MutationType.UPDATED, cv: updatedCv },
    });

    return updatedCv;
  }

  @Mutation(() => Boolean)
  async deleteCv(
    @Arg('id') id: string,
    @Ctx() { prisma, pubsub }: Context
  ): Promise<boolean> {
    // check existence first
    const toDelete = await prisma.cv.findUnique({ where: { id } });
    if (!toDelete) {
      return false;
    }

    // delete & include relations so we can publish them
    const deletedCv = await prisma.cv.delete({
      where: { id },
      include: { user: true, skills: true },
    });

    // publish deletion event
    await pubsub.publish(CV_CHANGED, {
      cvChanged: { mutation: MutationType.DELETED, cv: deletedCv },
    });

    return true;
  }

  @Subscription(() => CvChange, { topics: CV_CHANGED })
  cvChanged(@Root() payload: { cvChanged: CvChange }): CvChange {
    return payload.cvChanged;
  }
}