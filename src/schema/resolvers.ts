import { PubSub } from "graphql-subscriptions";
import { Cv, CvInput, MutationType } from "../types";

const pubsub = new PubSub();
const CV_CHANGED = "CV_CHANGED";

export const resolvers = {};
