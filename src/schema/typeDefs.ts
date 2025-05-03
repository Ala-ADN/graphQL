import {
  ObjectType,
  Field,
  InputType,
  registerEnumType,
  ID,
  Int,
} from 'type-graphql';
import { Role, MutationType } from '../types';
import {
  User as PrismaUser,
  Skill as PrismaSkill,
  Cv as PrismaCv,
} from '@prisma/client';


registerEnumType(Role, { name: 'Role' });
registerEnumType(MutationType, { name: 'MutationType' });

@ObjectType()
export class User implements PrismaUser {
  @Field(() => ID)      id!: string;
  @Field()              name!: string;
  @Field()              email!: string;
  @Field(() => Role)    role!: Role;
}

@ObjectType()
export class Skill implements PrismaSkill {
  @Field(() => ID)      id!: string;
  @Field()              designation!: string;
}

@ObjectType()
export class Cv implements PrismaCv {
  @Field(() => ID)      id!: string;
  @Field()              name!: string;
  @Field(() => Int)     age!: number;
  @Field()              job!: string;

  @Field(() => ID)      userId!: string;

  @Field(() => User)    user!: User;
  @Field(() => [Skill]) skills!: Skill[];
}

@InputType()
export class CvInput {
  @Field()              name!: string;
  @Field(() => Int)     age!: number;
  @Field()              job!: string;
  @Field(() => ID)      userId!: string;
  @Field(() => [ID])    skillIds!: string[];
}

@InputType()
export class CvUpdateInput {
  @Field(() => ID)      id!: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  age?: number;

  @Field({ nullable: true })
  job?: string;

  @Field(() => ID, { nullable: true })
  userId?: string;

  @Field(() => [ID], { nullable: true })
  skillIds?: string[];
}

@ObjectType()
export class CvChange {
  @Field(() => MutationType)
  mutation!: MutationType;

  @Field(() => Cv)
  cv!: Cv;
}
