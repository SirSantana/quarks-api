const {ApolloServer, gql} = require('apollo-server')
const dotenv = require('dotenv')
const {MongoClient, ObjectId} = require('mongodb')
dotenv.config()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')



const books=[
  {title:'1'},
  {title:'2'},
  {title:'3'}

]
const getUserFromToken=async(token, db)=>{
  console.log(token);
    const tokenData = jwt.verify(token, process.env.JWT_TOKEN)
    if(!tokenData?.id){return null}
    return await db.collection('User').findOne({_id:ObjectId(tokenData.id)})
}


const URL = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.exgvi.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`

const typeDefs = gql`
 type Query{
   getBook:Book
   getUser:User!

 }
  type Mutation {
    countBooks:Int
  }
  type Book{
    title:String
  }
  input SignUpInput {
    email: String!
    password: String!
    name: String!
    lastName:String!
    confirmPassword:String
  }
  
  input SignInInput {
    email: String!
    password: String!
  }
  type AuthUser {
    user: User!
    token: String!
  }
  type User {
    id: ID
    name: String
    email: String
    password:String
    avatar: String
    ciudad:String
    role:String
    status:String
    pais:String
  }
  
  
`;
const resolvers = {
    Query:{
getBook:()=> books,
getUser:async(_,{id}, {db, user}) => {
  return user
}
    },
    Mutation: {
      
      countBooks:()=>{
        return  books.length
      }
  
    },
  };


 
const start= async()=>{
    const client = new MongoClient(URL, {useNewUrlParser:true, useUnifiedTopology:true})

    await client.connect()

    const db = client.db('quarks')
   
    const server = new ApolloServer({ 
        typeDefs, 
        resolvers,
        context: async ({ req }) => {
          if(req.headers.authorization){
            const user = await getUserFromToken(req.headers.authorization, db);
            return {
              db,
            user
            }
          }else{
            return {
              db,
            }
          }
         
        },
      });

    server.listen().then(({url})=>{
        console.log(`Server ready at ${url}`)
    })
}

start()