import { createServer } from "node:http";
import { createYoga } from "graphql-yoga";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { typeDefs } from "./schema/typeDefs";
import { resolvers } from "./schema/resolvers";

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Create GraphQL yoga server
const yoga = createYoga({
  schema,
  graphiql: true,
});

const server = createServer(yoga);

server.listen(4000, () => {
  console.log(`Server running on http://localhost:4000/graphql`);
});
