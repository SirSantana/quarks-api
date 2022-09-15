const {ApolloServer, gql} = require('apollo-server')
const dotenv = require('dotenv')
const {MongoClient, ObjectId} = require('mongodb')
dotenv.config()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {GraphQLScalarType} = require('graphql')

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  parseValue(value) {
    return new Date(value);
  },
  serialize(value) {
    return value.toISOString();
  },
})

const books=[
  {title:'1'},
  {title:'2'},
  {title:'3'}

]
const getToken=(user)=> jwt.sign({id:user._id}, process.env.JWT_TOKEN)
const getUserFromToken = async (token, db) => {
  if (!token) { return null }
  const tokenData = jwt.verify(JSON.parse(token), process.env.JWT_TOKEN)
  if (!tokenData?.id) {
    return null;
  }
  return await db.collection('User').findOne({ _id: ObjectId(tokenData.id) });
}


const URL = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.exgvi.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`

const typeDefs = gql`
  scalar Date

  type MyType {
   created: Date
  }
  type Query {
    getUser:User!
    getCars:[Vehicule]
    getPrevGastos(id:ID):[Gasto]
    getAllGastos(id:ID):[Gasto]
    getOneGasto(id:ID):Gasto
    getOneUser(id:ID!):User!
    getAllUsers:[User]!
  }
  type Mutation {
    createCar(input:CreateVehiculeInput!):Vehicule
    updateCar(input:CreateVehiculeInput!):Vehicule
    createGasto(input:CreateGastoInput!):Gasto
    updateGasto(input:CreateGastoInput!):Gasto
    signUp(input: SignUpInput!): AuthUser
    signIn(input: SignInInput!): AuthUser

  }
  input SignUpInput {
    email: String!
    password: String!
    name: String!
    lastName:String!
    confirmPassword:String
  }
  input CreateGastoInput{
    tipo:String
    dineroGastado:String
    lugar:String
    imagen:String
    description:String
    fecha:Date
    carro:ID
    id:ID
  }
  type Gasto{
    tipo:String
    dineroGastado:String
    lugar:String
    imagen:String
    description:String
    id:ID
    fecha:Date
  }

  input CreateVehiculeInput{
    tipo:String
    referencia:String
    modelo:String
    cilindraje:String
    marca:String
    imagen:String
    user:ID
    id:ID
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
    vehiculos:[ID]
  }
  type Vehicule{
    tipo:String
    referencia:String
    modelo:String
    cilindraje:String
    marca:String
    imagen:String
    user:ID
    id:ID
    gastos:[ID]
  }

`;
const resolvers = {
    Query: {
      
      getAllUsers:async (_, __, { db, }) => {
        return await db.collection('User').find({}).toArray()
      },
    
      getCars:async(_, __, { db, user }) =>{
        const cars = await db.collection('Vehicule').find({ user: ObjectId(user._id)}).toArray()

        return cars;
      },
      getPrevGastos:async(_,{id}, {db})=>{
       const res =  await db.collection('Gasto').find({carro:id}).sort({fecha: -1}).limit(3).toArray()
       return res
      },
      getAllGastos:async(_,{id}, {db})=>{
        const res =  await db.collection('Gasto').find({carro:id}).sort({fecha: -1}).limit(20).toArray()
        return res.reverse()
       },
       getOneGasto:async(_,{id}, {db})=>{
        const res =  await db.collection('Gasto').findOne({_id:ObjectId(id)})
        console.log('res',res);
        return res
       },
      getOneUser:async(_, { id }, { db }) =>{
        return await db.collection('User').findOne({ _id: ObjectId(id) });
      },
     
      getUser:async(_,__, { user}) => {
        return user
      }
      
    },
    Mutation: {
      createCar:async (_, { input }, { db, user })=>{
        if (!user) { throw new Error('Authentication Error. Please sign in'); }
        const newCar = {...input, user:user._id}
        await db.collection('Vehicule').insertOne(newCar)
        db.collection('User')
              .updateOne({
                _id: ObjectId(user._id)
              }, {
                $push: {
                  vehiculos: newCar._id,
                }
              }
              )
        return newCar

      },
      createGasto:async (_, { input }, { db, user })=>{
        const {fecha, tipo, dineroGastado} = input
        if(tipo.length === 0){
          input.tipo = 'Tanqueada'
        }
        if(fecha == 'Invalid Date'){
          input.fecha = new Date()
        }
        if(dineroGastado.length=== 0){throw new Error('Debes agregar fecha, tipo y dinero gastado'); }
          const res = await db.collection('Gasto').insertOne(input).then(result =>
          db.collection('Gasto').findOne({ _id: result.insertedId }))
         db.collection('Vehicule')
              .updateOne({
                _id: ObjectId(input.carro)
              }, {
                $push: {
                  gastos: res._id,
                }
              })
              return res
              
      },
      signUp: async (_, { input }, { db, user }) => {
        try {
          
          const existUser = await db.collection('User').findOne({email:input.email})
        if(existUser)throw new Error('User already exist')
        if(input.password !== input.confirmPassword){
          throw new Error('Invalid Credentials')
        }
        const hashedPassword = bcrypt.hashSync(input.password);
        const newUser = {
          email:input.email, 
          name:input.name + " " + input.lastName,
          role:'Cliente',
          password: hashedPassword,
        }
        // save to database
         await db.collection('User').insertOne(newUser);
       const user = await db.collection('User').findOne({email:newUser.email})
        console.log('use', user);
        return {
          user,
          token: getToken(user),
        }
        } catch (error) {
          console.log(error);
          throw new Error(error)
        }
      },
  
      signIn: async (_, { input }, { db }) => {
        console.log('input', input);
        const user = await db.collection('User').findOne({ email: input.email });
        const isPasswordCorrect = user && bcrypt.compareSync(input.password, user.password);
        if (!user || !isPasswordCorrect) {
          throw new Error('Invalid credentials!');
        }
  
        return {
          user,
          token: getToken(user),
        }
      },
  
     
      updateCar:async(_, data, {db, user})=>{
        if (!user) { throw new Error('Authentication Error. Please sign in'); }
        const {input} = data
          console.log('dataaaaa',input);
        const result = await db.collection('Vehicule')
                                .findOneAndUpdate({
                                  _id:ObjectId(input.id)
                                },{
                                  $set:input
                                }, {
                                  returnDocument:'after'
                                })
      //  const res = await db.collection('Vehicule').findOne({ _id: ObjectId(input.id) });
      return result.value
      },
      updateGasto:async(_, data, {db, user})=>{
        if (!user) { throw new Error('Authentication Error. Please sign in'); }
        const {input} = data
          console.log('da',input);
        const result = await db.collection('Gasto')
                                .findOneAndUpdate({
                                  _id:ObjectId(input.id)
                                },{
                                  $set:input
                                }, {
                                  returnDocument:'after'
                                })
      //  const res = await db.collection('Vehicule').findOne({ _id: ObjectId(input.id) });
      return result.value
      },
      
      
    },
  
    User: {
      id: ({ _id, id }) => _id || id,
      vehiculos:async ( data , _, { db }) => {
        return data.vehiculos
      }
    },
    Vehicule:{
      id: ({ _id, id }) => _id || id,
    },
    Gasto:{
      id: ({ _id, id }) => _id || id,
    },
  
  
  };


 
const start= async()=>{
    const client = new MongoClient(URL, {useNewUrlParser:true, useUnifiedTopology:true})

    await client.connect()

    const db = client.db('quarks')
   
    const server = new ApolloServer({ 
        typeDefs, 
        resolvers: {
          ...resolvers,
          Date: dateScalar,
        },
        debug:true,
        
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
          }
        },
      });

    server.listen({ port: process.env.PORT || 5000 }).then(({url})=>{
        console.log(`Server ready at ${url}`)
    })
}

start()