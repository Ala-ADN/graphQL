import { createServer } from "node:http"
import { createYoga, createPubSub } from "graphql-yoga"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { WebSocketServer } from "ws"
import { useServer } from "graphql-ws/lib/use/ws"
import { execute, subscribe, parse, GraphQLSchema } from "graphql"

import { typeDefs } from "./schema/typeDefs"
import { resolvers } from "./schema/resolvers"
import { createContext } from "./context"

const pubsub = createPubSub<{
  CV_CHANGED: [payload: { cvChanged: { mutation: string; cv: any } }]
}>()

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

const yoga = createYoga<{
  db: any
  pubsub: typeof pubsub
}>({
  schema,
  context: () => createContext(pubsub),
  graphiql: { subscriptionsProtocol: "WS" },
  cors: { origin: "*" },
})

const server = createServer(yoga)

const wsServer = new WebSocketServer({
  server,
  path: "/graphql",
})

useServer(
  {
    schema,
    execute,
    subscribe,
    onSubscribe: (ctx, msg) => {
      const { payload } = msg
      const document = parse(payload.query)
      return {
        schema,
        document,
        variableValues: payload.variables,
        operationName: payload.operationName,
        contextValue: createContext(pubsub),
      }
    },
  },
  wsServer
)

server.listen(4000, () => {
  console.log("🚀 Server running at http://localhost:4000/graphql")
})