const { ApolloServer, gql } = require('apollo-server-express');
const dotenv = require('dotenv');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { GraphQLScalarType } = require('graphql');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const resolvers = require('../graphql/resolvers')
const typeDefs = require('../graphql/models')
dotenv.config();

const URL = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.exgvi.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`;

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.toISOString();
  },
});

// Función para validar y obtener usuario desde el token
const getUserFromToken = async (token, db) => {
  if (!token) return null;
  try {
    const tokenData = jwt.verify(token, process.env.JWT_TOKEN);
    return await db.collection('User').findOne({ _id: ObjectId(tokenData?.id) });
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

// Función para validar y obtener negocio desde el token
const getNegocioFromToken = async (token, db) => {
  if (!token) return null;
  try {
    const tokenData = jwt.verify(token, process.env.JWT_TOKEN);
    return await db.collection('NegocioVDos').findOne({ _id: ObjectId(tokenData?.id) });
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};

const start = async () => {
  const client = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const db = client.db('quarks');

  const app = express();

  // Configuración de CORS
  const allowedOrigins = [
    // 'http://localhost:3000',
    'https://www.quarks.com.co',
    'https://www.cotizatusrepuestos.com',
    'https://quarks-web-sirsantana.vercel.app',
    'https://wash-dash.vercel.app',
  ];
  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(helmet()); // Middleware de seguridad
  app.use(express.json({ limit: '2mb' }));

  // Limitador de tasas
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 40,
  });
  app.use('/graphql', limiter); // Aplicar limitador solo a la ruta de GraphQL

  // Middleware para manejo de errores
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  });

  const server = new ApolloServer({
    typeDefs,
    resolvers: {
      ...resolvers,
      Date: dateScalar,
    },
    debug: process.env.NODE_ENV !== 'production', // Debugging solo en desarrollo
    introspection: process.env.NODE_ENV !== 'production', // Introspección solo en desarrollo
    context: async ({ req }) => {
      const user = await getUserFromToken(req.headers.authorization, db);
      const negocio = await getNegocioFromToken(req.headers.authorization, db);
      return { db, user, negocio };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
};

start();