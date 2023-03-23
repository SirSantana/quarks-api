const { ApolloServer, gql } = require('apollo-server')
const dotenv = require('dotenv')
const { MongoClient, ObjectId } = require('mongodb')
dotenv.config()
const jwt = require('jsonwebtoken')
const { GraphQLScalarType } = require('graphql')
const resolvers = require('../graphql/resolvers')
const typeDefs = require('../graphql/models')
const mutations = require('../graphql/resolvers/mutations')

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

const URL = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.exgvi.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`

const SESSION_FILE_PATH = './session.json';
let sessionData;




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
  const clientWha = new Client({
    authStrategy: new LocalAuth()
  })
  if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = require(SESSION_FILE_PATH);
  }
 ;
  if (clientWha) {
    clientWha.on('authenticated', (authStrategy) => {
      sessionData = authStrategy;
      if(sessionData){
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(sessionData), (err) => {
          if (err) {
              console.error(err);
          }
      });
      }
      
    });
  }

  clientWha.on('qr', qr => {
    qrcode.generate(qr, { small: true });
  });
  // Escucha el evento de sesión lista
  clientWha.on('ready', () => {
    console.log('Cliente está listo papa!');
  //   clientWha.getChats().then(chat=>{
  //     const myChat = chat.find(el=> el.name === '+57 314 3551942')
  //     console.log(myChat);
  //     clientWha.sendMessage('576047829077@c.us', 'Hola bro').then(res=> console.log('res',res)).catch(err=> console.log('err',err))
  // })
  });

  // Escucha el evento de sesión cerrada
  clientWha.on('auth_failure', () => {
    console.log('Error de autenticación. Cerrando sesión...');
    clientWha.destroy();
  });

  // Escucha el evento de sesión iniciada



  const client = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  await client.connect()
  let totalIndexSize = 0;
  let totalDataSize = 0;
  const db = client.db('quarks')
  let stats = db.stats();
  totalIndexSize += (stats.then(res => console.log(res.indexSize / (1024 * 1024 * 1024))));
  totalDataSize += (stats.then(res => console.log(res.dataSize / (1024 * 1024 * 1024))));



  clientWha.initialize();


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
          clientWha
        }
      },
  });
  server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`Server ready at ${url}`)
  });
}

start()
