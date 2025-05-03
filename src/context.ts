import { PrismaClient } from '@prisma/client';
import { createPubSub } from 'graphql-yoga';

const pubsub = createPubSub();
const prisma = new PrismaClient();

export type Context = {
  prisma: PrismaClient;
  pubsub: typeof pubsub;
};

export const createContext = (): Context => ({
  prisma,
  pubsub,
});