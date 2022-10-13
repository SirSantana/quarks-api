 
const {ApolloServer, gql} = require('apollo-server')
 
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
   getMensajes(marca:String):[Mensaje]
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
   name:String
   avatar:String
 }
 input SignUpInput {
   email: String!
   password: String!
   name: String!
   apellido:String!
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
   name:String
   avatar:String
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

module.exports = typeDefs