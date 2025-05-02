import { Cv, CvInput, MutationType } from "../types";
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
    addCv: (_: never, { input }: { input: CvInput }, context: Context) => {
        const newCv: Cv = {
          id: String(Date.now()),
          ...input,
        };
        context.db.cvs.push(newCv);
        
        context.pubsub.publish("CV_CHANGED", {
          cvChanged: {
            mutation: MutationType.CREATED,
            cv: newCv
          }
        });
        
        return newCv;
      },

    updateCv: (_: never, { id, input }: { id: string, input: CvInput }, context: Context) => {
      const index = context.db.cvs.findIndex(cv => cv.id === id);
      if (index === -1) return null;
      const updatedCv = { ...context.db.cvs[index], ...input };
      context.db.cvs[index] = updatedCv;
      context.pubsub.publish(CV_CHANGED, { 
        cvChanged: { mutation: MutationType.UPDATED, cv: updatedCv } 
      });
      return updatedCv;
    },

    deleteCv: (_: never, { id }: { id: string }, context: Context) => {
      const index = context.db.cvs.findIndex(cv => cv.id === id);
      if (index === -1) return false;
      const [deletedCv] = context.db.cvs.splice(index, 1);
      context.pubsub.publish(CV_CHANGED, { 
        cvChanged: { mutation: MutationType.DELETED, cv: deletedCv } 
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