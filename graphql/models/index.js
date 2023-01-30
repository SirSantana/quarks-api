
const { ApolloServer, gql } = require('apollo-server')

const typeDefs = gql`
 scalar Date

 type MyType {
  created: Date
 }
 type Query {
   getCars:[Vehicule]
   getPrevGastos(id:ID):[Gasto]
   getAllGastos(id:ID):[Gasto]
   getOneGasto(id:ID):Gasto

   getUser:User!
   getOneUser(id:ID):User
   
   getRecordatorios(id:ID):[Recordatorio]!
   getOneRecordatorio(id:ID):Recordatorio
   getMensajes(marca:String):[Mensaje]
   getNegocios:[Negocio]
   getOneNegocio(id:ID):Negocio
   getAlmacenes:[Negocio]
   getAlmacens(split:Int):[Negocio]
   getTalleres:[Negocio]
  
   getProductos:[Producto]
   getOneProducto(id:ID):Producto

   getPreguntas(limit:Int,marca:String):[Pregunta]
   getOnePregunta(id:ID):Pregunta
   getBusquedaPreguntas(word:String):[Pregunta]
   getCotizaciones(id:ID):[Cotizacion]

   getCotizacionesUser(id:ID, limit:Int):[Cotizacion]
   getAvatar(id:ID):User
   preguntas(limit:Int, offset:Int):[Pregunta]
 }


 type Mutation {
   createCar(input:CreateVehiculeInput!):Vehicule
   updateCar(input:CreateVehiculeInput!):Vehicule

   createGasto(input:CreateGastoInput!):Gasto
   updateGasto(input:CreateGastoInput!):Gasto
   deleteGasto(id:ID!, idVehiculo:ID!):String

   createRecordatorio(input:RecordatorioInput!):Recordatorio
   deleteRecordatorio(id:ID!):String

   signUp(input: SignUpInput!): AuthUser
   signIn(input: SignInInput!): AuthUser
   editUser(input:UserInput!):User!
   editVendedor(input:VendedorEditInput):User


   createVendedor(input:VendedorCreateInput):String
   
   sendMessagePassword(email:String, codigo:Int):String
   changePassword(email:String,password:String, confirmPassword:String):String

   createMensaje(input:MensajeInput!):Mensaje

   createPregunta(input:PreguntaInput):Pregunta
   createCotizacion(input:CotizacionInput):Cotizacion

   uploadFile(file:String):String
 }
 
 
 input UserInput{
   name:String
   apellido:String
   avatar:String
   ciudad:String
   pais:String
 }
 
 input VendedorEditInput{
  name:String
  avatar:String
  ciudad:String
  pais:String
  direccion:String
  celular:String
  almacen:String
}
 input PreguntaInput{
  celular:String
  user:ID
  id:ID
  fecha:Date
  marca:String
  referencia:String
  userName:String
  titulo:String
  imagen:String
 }
 input CotizacionInput{
  garantia:String
  fecha:Date
  id:ID
  user:ID
  pregunta:ID
  marca:String
  descripcion:String
  precio:String
  envio:Boolean
  stock:String
  estado:String
 }
 input RecordatorioInput{
   titulo:String
   description:String
   fecha:Date
   vehiculo:ID
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
 type Pregunta{
  marca:String
  titulo:String
  userName:String
  cotizaciones:[ID]
  fecha:Date
  user:ID
  celular:String
  id:ID
  referencia:String
  extras:String
  imagen:String
 }
 type Cotizacion{
  descripcion:String
  precio:String
  marca:String
  fecha:Date
  user:ID
  pregunta:ID
  garantia:String
  id:ID
  imagen:String
  celular:String
  envio:Boolean
  stock:Int
  estado:String
  
 }
 type Producto{
  user:ID
  titulo:String
  descripcion:String
  precio:String
  garantia:String
  id:ID
  imagen:String
  linkpago:String
 }
 type Negocio{
  tipo:String
  nombre:String
  direccion:String
  ciudad:String
  pais:String
  premium:Boolean
  celular:String
  marcas:[String]
  repuestos:[String]
  id:ID

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
   vehiculo:ID
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
 input VendedorCreateInput{
  email:String
  name:String
  almacen:String
  direccion:String
  ciudad:String
  celular:String
  verified:Boolean
  marcas:[Boolean]
  password:String
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
   cotizaciones:[ID]
   verified:Boolean
   marcas:[String]
   celular:String
   direccion:String
   almacen:String
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