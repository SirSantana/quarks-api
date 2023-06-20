const { ApolloServer, gql } = require('apollo-server-express')
const dotenv = require('dotenv')
const { MongoClient, ObjectId } = require('mongodb')
dotenv.config()
const jwt = require('jsonwebtoken')
const { GraphQLScalarType } = require('graphql')
const resolvers = require('../graphql/resolvers')
const typeDefs = require('../graphql/models')
const mutations = require('../graphql/resolvers/mutations')
const express = require('express');
const cors = require('cors');



const URL = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.exgvi.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`


const dateScalar = new GraphQLScalarType({
  name: 'Date',
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.toISOString();
  },
})


const getUserFromToken = async (token, db) => {
  if (!token) { return null }
  const tokenData = jwt.verify(JSON.parse(token), process.env.JWT_TOKEN)
  if (!tokenData?.id) {
    return null;
  }
  return await db.collection('User').findOne({ _id: ObjectId(tokenData?.id) });
}


const start = async () => {




  const client = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  await client.connect()
  let totalIndexSize = 0;
  let totalDataSize = 0;
  const db = client.db('quarks')
  let stats = db.stats();
  totalIndexSize += (stats.then(res => console.log(res.indexSize / (1024 * 1024 * 1024))));
  totalDataSize += (stats.then(res => console.log(res.dataSize / (1024 * 1024 * 1024))));



  const app = express();
  let desarrollo = 'http://localhost:3000'
  let build = 'https://www.quarks.com.co'

  app.use(cors({
    origin: desarrollo,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      ...resolvers,
      Date: dateScalar,
    },
    debug: true,
    introspection: false,
    context:
    
      // async ({ req }) => {
      //   console.log('req',req.headers.authorization);
      //   const user = await getUserFromToken(req.headers.authorization, db);
      //   console.log('userrrr',user);
      //   return {
      //     db,
      //     user,
      //   }
      // },
      async ({ req }) => {
        const user = await getUserFromToken(req.headers.authorization, db);
        return {
          db,
          user,
          // clientWha
        }
      },
  });
  await server.start();
  server.applyMiddleware({ app });
  const port = process.env.PORT || 4000;

  app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
}

start()
