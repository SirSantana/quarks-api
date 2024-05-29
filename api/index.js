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
const rateLimit = require('express-rate-limit');

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

const getNegocioFromToken = async (token, db) => {
  if (!token) { return null }
  const tokenData = jwt.verify(JSON.parse(token), process.env.JWT_TOKEN)
  if (!tokenData?.id) {
    return null;
  }
  const negocio = await db.collection('NegocioVDos').findOne({ _id: ObjectId(tokenData?.id) });
  return negocio
}
const start = async () => {

  const client = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  await client.connect()
  let totalIndexSize = 0;
  let totalDataSize = 0;
  const db = client.db('quarks')

  // TTL INDEXES 
  // const collection = db.collection('ReportePriceGasolinera');
  // // const indexes = await collection.indexes();

  // await collection.dropIndex('fecha_1');
  // console.log('Índice TTL existente eliminado.');

  // //add TTL
  // await collection.createIndex(
  //   { fecha: 1 },
  //   { expireAfterSeconds: 15 * 24 * 60 * 60 } // 30 días en segundos
  // );
  
  // let stats = db.stats();
  // totalIndexSize += (stats.then(res => console.log(res.indexSize / (1024 * 1024 * 1024))));
  // totalDataSize += (stats.then(res => console.log(res.dataSize / (1024 * 1024 * 1024))));

  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 40, // limit each IP to 100 requests per windowMs

  });
  const app = express();
  let desarrollo = 'http://localhost:3000'
  let build = 'https://www.quarks.com.co'
  let build2 = 'https://www.cotizatusrepuestos.com'
  let build3 = 'https://quarks-web-sirsantana.vercel.app'
  let buil4 = 'www.quarks.com.co'

  app.use(cors({
    origin: [build, build2, build3, buil4, desarrollo],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json({ limit: '2mb' }))
  // app.use(limiter);
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
        const negocio = await getNegocioFromToken(req.headers.authorization, db);
        return {
          db,
          user,
          negocio
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
