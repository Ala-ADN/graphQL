import "reflect-metadata";
import { buildSchemaSync } from "type-graphql";
import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import { CvResolver } from "./schema/resolvers";
import { createContext } from "./context";
import { execute, subscribe, parse } from 'graphql';

const schema = buildSchemaSync({
  resolvers: [CvResolver],
  pubSub: createContext().pubsub,
});

const yoga = createYoga({
  schema,
  context: createContext(),
  graphiql: { subscriptionsProtocol: "WS" },
  cors: { origin: "*" },
});

const server = createServer(yoga);
const wsServer = new WebSocketServer({ server, path: "/graphql" });

useServer(
  {
    schema,
    execute: (args) => args.rootValue ? args.rootValue : execute(args),
    subscribe,
    onSubscribe: async (ctx, msg) => {
      const args = {
        schema,
        operationName: msg.payload.operationName,
        document: parse(msg.payload.query),
        variableValues: msg.payload.variables,
        contextValue: createContext(),
      };
      return args;
    },
  },
  wsServer
);

server.listen(4000, () => {
  console.log("🚀 Server running at http://localhost:4000/graphql");
});