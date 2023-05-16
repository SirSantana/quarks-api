
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
   getGastosMonth(id:ID):[Gasto]

   
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
   getAlmacenesRepuestos:[Almacen]
   getAlmacenRepuestos(id:ID):Almacen
   getBusquedaAlmacenes(categoria:String, marca:String):[Almacen]
   getAlmacenesByCategoria(categoria:String):[Almacen]
   getAlmacenesRecomendados:[Almacen]

  
   getProductos:[Producto]
   getOneProducto(id:ID):Producto

   getPreguntas(limit:Int,marca:String):[Pregunta]
   getLastPreguntas:[Pregunta]
   getPreguntasUser:[Pregunta]

   getOnePregunta(id:ID):Pregunta
   getBusquedaPreguntas(word:String):[Pregunta]
   getCotizaciones(id:ID):[Cotizacion]

   getCotizacionesUser(id:ID, limit:Int):[Cotizacion]
   getAvatar(id:ID):User
   preguntas(limit:Int, offset:Int):[Pregunta]

   getScore:[User]
   getBatallas:[Batalla]
   getOpiniones(id:ID):[Opinion]
   getCalificacionOpiniones(id:ID):String
 }


 type Mutation {
   createCar(input:CreateVehiculeInput!):Vehicule
   updateCar(input:CreateVehiculeInput!):Vehicule
   deleteCar(id:ID!):String


   createGasto(input:CreateGastoInput!):Gasto
   updateGasto(input:CreateGastoInput!):Gasto
   deleteGasto(id:ID!, idVehiculo:ID!):String
   createPresupuesto(id:ID!,presupuesto:String):Vehicule

   createRecordatorio(input:RecordatorioInput):Recordatorio
   editRecordatorio(input:RecordatorioInput):Recordatorio
   deleteRecordatorio(id:ID!):String

   signUp(input: SignUpInput!): AuthUser
   signUpWithoutEmail(name:String): AuthUser

   signIn(input: SignInInput!): AuthUser
   editUser(input:UserInput!):User!
   addEmailUser(input:AddEmailInput!):User!

   editVendedor(input:VendedorEditInput):User


   createVendedor(input:VendedorCreateInput):String
   
   sendMessagePassword(email:String, codigo:Int):String
   changePassword(email:String,password:String, previusPassword:String):String

   createMensaje(input:MensajeInput!):Mensaje

   createPregunta(input:PreguntaInput):Pregunta
   createCotizacion(input:CotizacionInput):Cotizacion

   contactoEmail(name:String, email:String, mensaje:String):String
   uploadFile(file:String):String

   userRecurrent:String

   createVote(id:String, idCarro:String):String

   interesadoPremium(celular:String, email:String):String

   
   createOpinion(input:CreateOpinionInput):Opinion
   createVisitaAlmacen(id:ID):String
   interesadoAlmacen(celular:String, name:String, fecha:Date, almacen:ID):String

 }
 
 
 input UserInput{
   name:String
   apellido:String
   avatar:String
   ciudad:String
   pais:String
 }
 input AddEmailInput{
  email:String
  password:String
  confirmPassword:String
 }
 input CreateOpinionInput{
  email:String
  fecha:Date
  idpregunta:ID
  descripcion:String
  calificacion:Int
  celular:Int
  almacen:ID
 }
 input VendedorEditInput{
  name:String
  avatar:String
  ciudad:String
  pais:String
  direccion:String
  celular:String
  almacen:String
  id:ID

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
   tipo:String
   fechaInicial:Date
   fechaFinal:Date
   kilometrajeInicial:String
   kilometrajeFinal:String
   vehiculo:ID
   id:ID
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
 type Batalla{
  id:ID
  carroUno:String
  carroDos:String
  carroUnoId:String
  carroDosId:String
  carroUnoVotos:Int
  carroDosVotos:Int
  carroUnoImg:String
  carroDosImg:String
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
   tipo:String
   fechaInicial:Date
   fechaFinal:Date
   id:ID
   vehiculo:ID
   kilometrajeInicial:String
   kilometrajeFinal:String
 }
 type Opinion{
  email:String
  celular:Int
  fecha:Date
  calificacion:Int
  likes:Int
  descripcion:String
  id:ID
  idpregunta:ID
  comentarios:[Opinion]
  almacen:ID
 }
 type Almacen{
  nombre:String
  direccion:String
  marcas:[String]
  fotoperfil:String
  categorias:[String]
  facebook:String
  paginaweb:String
  verified:Boolean
  fechapago:Date
  mesespago:Int
  descripcion:String
  visitas:Int
  id:ID
  opiniones:[ID]
  user:ID
  ciudad:String
  celular:String
  barrio:String
  calidades:[String]
  ubicacionmaps:String
  recomendado:Boolean
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
   preguntas:[ID]
   verified:Boolean
   marcas:[String]
   celular:String
   direccion:String
   almacen:String
   puntos:Int
   premium:Int
   recurrent:[Date]


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
   presupuesto:String
 }


`;

module.exports = typeDefs