import { Cv, CvInput, CvUpdateInput, MutationType } from "../types";
import { Context } from "../context";

const CV_CHANGED = 'CV_CHANGED';

export const resolvers = {
  Cv: {
    user: (parent: Cv, _: never, context: Context) => 
      context.db.users.find(user => user.id === parent.userId),
    skills: (parent: Cv, _: never, context: Context) => 
      context.db.skills.filter(skill => parent.skillIds.includes(skill.id)),
  },

  Query: {
    cvs: (_: never, __: never, context: Context) => context.db.cvs,
    cv: (_: never, { id }: { id: string }, context: Context) => 
      context.db.cvs.find(cv => cv.id === id),
  },

  Mutation: {
    addCv: (
      _parent: unknown,
      { input }: { input: CvInput },
      context: Context
    ): Cv => {
      const { users, skills, cvs } = context.db;

      // 1. verify user exists
      if (!users.some(u => u.id === input.userId)) {
        throw new Error(`User id="${input.userId}" introuvable`);
      }
      // 2. verify skills exist
      for (const sId of input.skillIds) {
        if (!skills.some(s => s.id === sId)) {
          throw new Error(`Skill id="${sId}" introuvable`);
        }
      }

      // 3. generate new numeric ID
      const maxId = cvs.reduce((m, cv) => Math.max(m, Number(cv.id)), 0);
      const newCv: Cv = {
        id: String(maxId + 1),
        ...input,
      };

      cvs.push(newCv);

      // 4. publish creation event
      context.pubsub.publish(CV_CHANGED, {
        cvChanged: {
          mutation: MutationType.CREATED,
          cv: newCv,
        },
      });

      return newCv;
    },

    updateCv: (
      _parent: unknown,
      { input }: { input: CvUpdateInput },
      context: Context
    ): Cv | null => {
      const { users, skills, cvs } = context.db;
      const cv = cvs.find(c => c.id === input.id);
      if (!cv) throw new Error(`CV id="${input.id}" introuvable`);

      // if changing userId, verify
      if (input.userId !== undefined &&
          !users.some(u => u.id === input.userId)) {
        throw new Error(`User id="${input.userId}" introuvable`);
      }
      // if changing skillIds, verify each
      if (input.skillIds) {
        for (const sId of input.skillIds) {
          if (!skills.some(s => s.id === sId)) {
            throw new Error(`Skill id="${sId}" introuvable`);
          }
        }
        cv.skillIds = input.skillIds;
      }

      // update provided fields
      if (input.name   !== undefined) cv.name   = input.name;
      if (input.age    !== undefined) cv.age    = input.age;
      if (input.job    !== undefined) cv.job    = input.job;
      if (input.userId !== undefined) cv.userId = input.userId;

      // publish update event
      context.pubsub.publish(CV_CHANGED, {
        cvChanged: {
          mutation: MutationType.UPDATED,
          cv,
        },
      });

      return cv;
    },

    deleteCv: (
      _parent: unknown,
      { id }: { id: string },
      context: Context
    ): boolean => {
      const cvs = context.db.cvs;
      const idx = cvs.findIndex(c => c.id === id);
      if (idx === -1) return false;

      const [deletedCv] = cvs.splice(idx, 1);

      // publish deletion event
      context.pubsub.publish(CV_CHANGED, {
        cvChanged: {
          mutation: MutationType.DELETED,
          cv: deletedCv,
        },
      });

      return true;
    },
  },

  Subscription: {
    cvChanged: {
      subscribe: (_: never, __: never, context: Context) =>
        context.pubsub.subscribe("CV_CHANGED"),
      resolve: (payload: { cvChanged: any }) => payload.cvChanged,
    },
  },
};