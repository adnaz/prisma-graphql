const { ApolloServer,PubSub } = require('apollo-server');
const { PrismaClient } = require('@prisma/client')
const fs = require('fs');
const path = require('path');
const { getUserId } = require('./utils');
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const User = require('./resolvers/User')
const Link = require('./resolvers/Link')
const Vote = require('./resolvers/Vote')
const Subscription = require('./resolvers/Subscription')

const pubsub = new PubSub();
// 1
const typeDefs = `
  type Query {
    info: String!
    feed: [Link!]!
  }
  type Link {
    id: ID!
    description: String!
    url: String!
    postedBy: User
  }
  type AuthPayload {
    token: String
    user: User
  }
  type User {
    id: ID!
    name: String!
    email: String!
    links: [Link!]!
  }
  type Mutation {
    post(url: String!, description: String!): Link!
    signup(email: String!, password: String!, name: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
  }

`

// 2
const resolvers = {
  Query,
  Mutation,
  User,
  Link,
  Vote,
  Subscription
}
const prisma = new PrismaClient()
// 3
const server = new ApolloServer({
    typeDefs: fs.readFileSync(
        path.join(__dirname, 'schema.graphql'),
        'utf8'
      ),
  resolvers,
  context: ({ req }) => {
    return {
      ...req,
      prisma,
      pubsub,
      userId:
        req && req.headers.authorization
          ? getUserId(req)
          : null
    };
  }
})

server
  .listen()
  .then(({ url }) =>
    console.log(`Server is running on ${url}`)
  );