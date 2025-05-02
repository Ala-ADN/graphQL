import { gql } from "graphql-tag";

export const typeDefs = gql`
  # Enums
  enum Role {
    USER
    ADMIN
  }

  enum MutationType {
    CREATED
    UPDATED
    DELETED
  }

  # Types
  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
  }

  type Skill {
    id: ID!
    designation: String!
  }

  type Cv {
    id: ID!
    name: String!
    age: Int!
    job: String!
    user: User!
    skills: [Skill!]!
  }

  type CvChange {
    mutation: MutationType!
    cv: Cv!
  }

  # Input Types
  input CvInput {
    name: String!
    age: Int!
    job: String!
    userId: ID!
    skillIds: [ID!]!
  }

  # Queries
  type Query {
    cvs: [Cv!]!
    cv(id: ID!): Cv
  }

  # Mutations
  type Mutation {
    addCv(input: CvInput!): Cv
    updateCv(id: ID!, input: CvInput!): Cv
    deleteCv(id: ID!): Boolean
  }

  # Subscriptions
  type Subscription {
    cvChanged: CvChange!
  }
`;
