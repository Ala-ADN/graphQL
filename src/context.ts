import { createPubSub } from "graphql-yoga";
import { Cv, Skill, User, Role } from "./types";

// Mock data
export const users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', role: Role.ADMIN },
  { id: '2', name: 'Bob', email: 'bob@example.com', role: Role.USER },
];

export const skills: Skill[] = [
  { id: '1', designation: 'GraphQL' },
  { id: '2', designation: 'TypeScript' },
  { id: '3', designation: 'React' },
];

export const cvs: Cv[] = [
  { id: '1', name: 'Dev CV', age: 30, job: 'Developer', userId: '1', skillIds: ['1', '2'] },
  { id: '2', name: 'Design CV', age: 25, job: 'Designer', userId: '2', skillIds: ['3'] },
];

export type Context = {
    db: {
      users: User[]
      skills: Skill[]
      cvs: Cv[]
    }
    pubsub: ReturnType<typeof createPubSub<{
      CV_CHANGED: [payload: { cvChanged: { mutation: string; cv: Cv } }]
    }>>
  }
  
export const createContext = (
    pubsub: ReturnType<typeof createPubSub>
    ): Context => ({
    db: { users, skills, cvs },
    pubsub,
})