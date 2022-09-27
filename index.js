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

const getToken=(user)=> jwt.sign({id:user?._id}, process.env.JWT_TOKEN)
const getUserFromToken = async (token, db) => {
  if (!token) { return null }
  const tokenData = jwt.verify(JSON.parse(token), process.env.JWT_TOKEN)
  if (!tokenData?.id) {
    return null;
  }
  return await db.collection('User').findOne({ _id: ObjectId(tokenData?.id) });
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
    getRecordatorios:[Recordatorio]!
    getOneRecordatorio(id:ID):Recordatorio
  }

  type Mutation {
    createCar(input:CreateVehiculeInput!):Vehicule
    updateCar(input:CreateVehiculeInput!):Vehicule
    createGasto(input:CreateGastoInput!):Gasto
    updateGasto(input:CreateGastoInput!):Gasto
    deleteGasto(id:ID!, idVehiculo:ID!):String
    deleteRecordatorio(id:ID!):String
    signUp(input: SignUpInput!): AuthUser
    signIn(input: SignInInput!): AuthUser
    editUser(input:UserInput!):User!
    createRecordatorio(input:RecordatorioInput!):Recordatorio
    createMensaje(input:MensajeInput!):Mensaje
  }
  input UserInput{
    name:String
    apellido:String
    avatar:String
    ciudad:String
    pais:String
  }
  input RecordatorioInput{
    titulo:String
    description:String
    fecha:Date
  }
  input MensajeInput{
    texto:String
    fecha:Date
    marca:String
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
    vehiculo:ID
    id:ID
  }
  type Gasto{
    tipo:String
    dineroGastado:String
    lugar:String
    imagen:String
    description:String
    id:ID
    vehiculo:ID
    fecha:Date
  }
  type Grupo{
    name:String
    miembros:[User]
    mensajes:[Mensaje]
  }
  type Mensaje{
    texto:String
    user:ID
    fecha:Date
    marca:String
    auto:String
  }
  type Recordatorio{
    titulo:String
    description:String
    fecha:Date
    id:ID
    user:ID
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
    apellido:String
    email: String
    password:String
    avatar: String
    ciudad:String
    role:String
    status:String
    pais:String
    vehiculos:[ID]
    recordatorio:[ID]
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
      getRecordatorios:async(_, __, { db, user }) =>{
        const recordatorios = await db.collection('Recordatorio').find({ user: ObjectId(user._id)}).sort({fecha:1}).toArray()

        return recordatorios;
      },
      getPrevGastos:async(_,{id}, {db})=>{
       const res =  await db.collection('Gasto').find({vehiculo:id}).sort({fecha: -1}).limit(3).toArray()
       return res
      },
      getAllGastos:async(_,{id}, {db})=>{
        const res =  await db.collection('Gasto').find({vehiculo:id}).sort({fecha: -1}).limit(20).toArray()
        return res.reverse()
       },
       getOneGasto:async(_,{id}, {db})=>{
        const res =  await db.collection('Gasto').findOne({_id:ObjectId(id)})
        return res
       },
       getOneRecordatorio:async(_,{id}, {db})=>{
        const res =  await db.collection('Recordatorio').findOne({_id:ObjectId(id)})
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
      editUser:async(_,{input}, {db, user})=>{
        if (!user) { throw new Error('Authentication Error. Please sign in'); }
        const result = await db.collection('User')
                                .findOneAndUpdate({
                                  _id:user._id
                                },{
                                  $set:input
                                }, {
                                  returnDocument:'after'
                                })
                                console.log(result);
      return result.value
        
      },
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
        const newInput = {...input, dineroGastado:input.dineroGastado.replace(/[^0-9]/g, '')}
        if(dineroGastado.length=== 0){throw new Error('Debes agregar fecha, tipo y dinero gastado'); }
          const res = await db.collection('Gasto').insertOne(newInput).then(result =>
          db.collection('Gasto').findOne({ _id: result.insertedId }))
          db.collection('Vehicule')
              .updateOne({
                _id: ObjectId(input.vehiculo)
              }, {
                $push: {
                  gastos: res._id,
                }
              })
              return res
              
      },
      createRecordatorio:async (_, {input}, {db, user})=>{
        if (!user) { throw new Error('Authentication Error. Please sign in'); }
        const newRecordatorio = {...input, user:user._id}
        await db.collection('Recordatorio').insertOne(newRecordatorio)
        db.collection('User')
        .updateOne({
          _id: ObjectId(user._id)
        }, {
          $push: {
            recordatorio: newRecordatorio._id,
          }
        }
        )
      return newRecordatorio

      },
      createMensaje:async (_, {input}, {db, user})=>{

        console.log(input);

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
      deleteGasto:async(_, {id, idVehiculo}, {db, user})=>{
        console.log(id, idVehiculo);
        if (!user) { throw new Error('Authentication Error. Please sign in'); }
        try {
          await db.collection('Gasto').deleteOne({_id:ObjectId(id)})
          await db.collection('Vehicule').updateOne({_id:ObjectId(idVehiculo)}, {$pull:{gastos:ObjectId(id)}})
          return id
        } catch (error) {
          throw new Error('Ha ocurrido un error');
        }
      },
      deleteRecordatorio:async(_, {id}, {db, user})=>{
        if (!user) { throw new Error('Authentication Error. Please sign in'); }
        console.log(id, user._id);
        try {
          await db.collection('Recordatorio').deleteOne({_id:ObjectId(id)})
          await db.collection('User').updateOne({_id:ObjectId(user._id)}, {$pull:{recordatorio:ObjectId(id)}})
          return id
        } catch (error) {
          throw new Error('Ha ocurrido un error');
        }
      }
      
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
    Recordatorio:{
      id: ({ _id, id }) => _id || id,
    },
  
  
  };


const start= async()=>{
    const client = new MongoClient(URL, {useNewUrlParser:true, useUnifiedTopology:true})

    await client.connect()
    let totalIndexSize = 0;
    let totalDataSize = 0;
    const db = client.db('quarks')
    let stats = db.stats();
    totalIndexSize += (stats.then(res=> console.log(res.indexSize /(1024*1024*1024)) )) ;
    totalDataSize += (stats.then(res=> console.log(res.dataSize /(1024*1024*1024)))) ;

    console.log("Total index size in GB: " + totalIndexSize);
    console.log("Total data size in GB: " + totalDataSize);

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

    server.listen({ port: process.env.PORT || 4000 }).then(({url})=>{
        console.log(`Server ready at ${url}`)
    })
}

start()