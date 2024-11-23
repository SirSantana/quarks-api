
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

   
   getUser:User
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
   getRevisiones(id:ID):[Revision]


   getAllArticulos:[Articulo]
   getArticulo(id:ID):Articulo
   getArticulosBlog:[Articulo]

   getVistasArticulo(id:ID):String

   getNegocioVDos:[NegocioVDos]
   getNegocioVDosOne:NegocioVDos
   getNegocioVDosByEmail(email:String):String
   getNegocioVDosByEmailDos(email:String):NegocioVDos
   getWhatsappNegocio(id:ID):String
   getOneNegocioVDos(userName:String):NegocioVDos
   getNegociosVDosByTipo(tipo:String):[NegocioVDos]
   getNegociosVDosByServicio(tipo:String):[NegocioVDos]

   getSearch(text:String):[NegocioVDos]

   

   getStadisticsHalfMonth(id:ID):NegocioVDos
   getServiciosNegocio(userName:String):NegocioVDos
   getReportsPrice(gasolinera:String):[ReportePriceGasolinera]

   getTicketsNegocio(negocio:String):[TicketLavado]
   getTicketLavado(id:ID):TicketLavado





   getAllAdminAccion:[Accion]
   getAccionNegocio(id:ID):[Accion]


   getConsumos:[Consumo]
   verifyAccountCheck(userName:String):Boolean

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

   interesadoPremium(nombre:String, email:String):String

   createSugerencia(input:CreateSugerenciaInput):String
   

   createOpinion(input:CreateOpinionInput):Opinion
   createVisitaAlmacen(id:ID):String
   createVisitaWhatsapp(id:ID):String
   createClickTelefono(id:ID):String
   createClickMapaDireccion(id:ID):String
   createClickCompartido(id:ID):String
   createClickNegocioPrevMap(id:ID):String
   createClickNegocioMap(id:ID):String

   
   createImpresionAlmacen(id:ID):String
   interesadoAlmacen(celular:String, name:String, fecha:Date, almacen:ID):String
   interesadoAnuncio(name:String, celular:String, fecha:Date, almacen:ID,  ):String

   createVistaArticulo(id:ID):String
   createTaller(input:CreateTallerInput):NegocioVDos
   createSolicitudServicio(input:CreateSolicitudServicio):String
   createAccion(input:CreateAccion):String



   createConsumo(fecha:String, galon:String, consumo:String):Consumo
   createNegocioVDos(email:String, password:String, username:String):AuthNegocioVDos
   editNegocioVDos(input:EditNegocioInput):NegocioVDos
   editNegocioVDosRedes(input:EditNegocioInputRedes):NegocioVDos


   signInNegocio(email:String, password:String):AuthNegocioVDos

   createReportPrice(input:CreateReportPriceInput):String
   createLavadero(input:CreateLavaderoInput):NegocioVDos
   createTicketLavado(input:CreateTicketInput):TicketLavado
   editTicketLavado(input:EditTicketInput):TicketLavado
   deleteTicketLavado(id:ID!):String
 }

 
 input UserInput{
   name:String
   apellido:String
   avatar:String
   ciudad:String
   pais:String
 }
 input CreateReportPriceInput{
   nombre:String
   precio:String
   fecha:Date
   votoP:Int
   votoN:Int
   email:String 
   gasolinera:String 
   combustible:String
 }
 input CreateLavaderoInput{
   nombre:String
   direccion:String
   fecha:Date
   whatsapp:String
   email:String
   userName:String
   tipo:String
 }
 input CreateTicketInput{
  marca:String
  modelo:String
  fecha:Date
  negocio:String
  whatsapp:String
  status:Int
  autolavado:String
  whatsappAutolavado:String
  tiempoEstimado:String

 }

 input EditTicketInput{
  marca:String
  modelo:String
  id:String  
  whatsapp:String
  status:Int
 }
 input CreateTallerInput{
  nombre:String
  direccion:String
  localidad:String
  telefono:String
  whatsapp:String
  categorias:[String]
  fecha:Date
  horario:String
 }
 input CreateSugerenciaInput{
  tipo:String
  sugerencia:String
  fecha:Date
 }
 input EditNegocioInput{
  direccion:String
  ciudad:String
  pais:String
  whatsapp:String
  telefono:String
  horario:String
  fotoperfil:String
  categorias:[String]
  nombre:String

  email:String
  indicativo:String
  tipo:String
  vehiculo:String
  coordenadas:[Float]
  userName:String

 }
 input EditNegocioInputRedes{
  facebook:String
  instagram:String
  paginaweb:String
  direccion:String
  ciudad:String
  pais:String
  whatsapp:String
  telefono:String
  horario:String
  nombre:String
  indicativo:String
  coordenadas:[Float]
  email:String
  fotoperfil:String
  categorias:[String]

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
  foto:String
  nombre:String
  marca:String
  servicios:[String]
  referencia:String
 }
 input CreateSolicitudServicio{
  nombre:String
  marca:String
  servicios:[String]
  referencia:String
  celular:String
  almacen:ID
  descripcion:String
  fecha:Date
  indicativo:String
 }
 input CreateAccion{
  tipo:String
  almacen:ID
  fecha:Date
  estado:String
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
 type ReportePriceGasolinera{
  combustible:String
  precio:String
  fecha:Date
  votoP:Int
  votoN:Int
  email:String
  nombre:String
  gasolinera:String
  id:ID
 }
 type Revision{
   descripcion:String
   id:ID
   fecha:Date
   almacen:ID
   nombre:String
   servicios:[String]
   marca:String
   referencia:String
   celular:String
 }
 type Accion{
   id:ID
   fecha:Date
   almacen:ID
   tipo:String
   estado:String
   servicios:[String]
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
 type Consumo{
  fecha:String
  consumo:String
  galon:String
 }
 
 type TicketLavado{
  fecha:String
  marca:String
  modelo:String
  negocio:ID
  whatsapp:String
  autolavado:String
  whatsappAutolavado:String
  status:Int
  id:ID
  tiempoEstimado:String
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
  nombre:String
  foto:String
  servicios:[String]
  marca:String
  referencia:String
  pagina:String
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
 type NegocioVDos{
  nombre:String
  direccion:String
  fotoperfil:String
  categorias:[String]
  facebook:String
  paginaweb:String
  instagram:String
  visitas:Int
  whatsapp:String
  telefono:String
  acercanegocio:String
  localidad:String
  ciudad:String
  pais:String
  fotossecundarias:[String]
  opiniones:[ID]
  id:ID
  sponsored:String
  nivelnegocio:String
  horario:String
  ubicacionmaps:String
  visitaswhatsapp:Int
  impresion:Int
  vecescompartido:Int
  clicksnegociomapa:Int
  clicksnegocioprevmapa:Int
  vecestelefono:Int
  visitasmapa:Int
  numerocalificacionesmaps:String
  promediocalificacionesmaps:String
  urltallermaps:String
  userName:String
  tipo:String
  marcasAutos:[String]
  email:String
  password:String
  revisiones:[ID]
  vehiculo:String
  coordenadas:[Float]
  fechaCreated:Date
  indicativo:String
  lat:String
  lng:String
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
 type AuthNegocioVDos {
  negocio: NegocioVDos!
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
 type Articulo{
  fecha:Date
  id:ID
  tituloPrincipal:String
  autor:String
  tiempoLectura:Int
  vistas:Int
  subtituloPrincipal:String
  imgPrincipal:String
  palabrasClave:[String]
  tema:String
  descripcion:String
  keywords:String
  blog:Boolean

  tituloParrafoUno:String
  parrafoUno:String
  parrafoUnoDos:String
  parrafoUnoTres:String
  imgParrafoUno:String
  videoUrlUno:String

  tituloParrafoDos:String
  parrafoDos:String
  parrafoDosDos:String
  parrafoDosTres:String
  imgParrafoDos:String
  videoUrlDos:String

  tituloParrafoTres:String
  parrafoTres:String
  parrafoTresDos:String
  parrafoTresTres:String
  imgParrafoTres:String
  videoUrlTres:String

  tituloParrafoCuatro:String
  parrafoCuatro:String
  parrafoCuatroDos:String
  parrafoCuatroTres:String
  imgParrafoCuatro:String
  videoUrlCuatro:String

  tituloParrafoCinco:String
  parrafoCinco:String
  parrafoCincoDos:String
  parrafoCincoTres:String
  imgParrafoCinco:String
  videoUrlCinco:String

  tituloParrafoSeis:String
  parrafoSeis:String
  parrafoSeisDos:String
  parrafoSeisTres:String
  imgParrafoSeis:String
  videoUrlSeis:String

 }

`;

module.exports = typeDefs