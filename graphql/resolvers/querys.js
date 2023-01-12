const { ObjectId } = require("mongodb");

const querys = {
 
  //CAR
  getCars: async (_, __, { db, user }) => {
    const cars = await db
      .collection("Vehicule")
      .find({ user: ObjectId(user._id) })
      .toArray();
    return cars;
  },

  //RECORDATORIOS
  getRecordatorios: async (_, {id}, { db }) => {
    const recordatorios = await db
      .collection("Recordatorio")
      .find({ vehiculo: id })
      .sort({ fecha: 1 })
      .toArray();
    return recordatorios;
  },
  getOneRecordatorio: async (_, { id }, { db }) => {
    const res = await db
      .collection("Recordatorio")
      .findOne({ _id: ObjectId(id) });
    return res;
  },


  //GASTOS
  getPrevGastos: async (_, { id }, { db }) => {
    const res = await db
      .collection("Gasto")
      .find({ vehiculo: id })
      .sort({ fecha: -1 })
      .limit(3)
      .toArray();
    return res;
  },
  getAllGastos: async (_, { id }, { db }) => {
    const res = await db
      .collection("Gasto")
      .find({ vehiculo: id })
      .sort({ fecha: -1 })
      .limit(20)
      .toArray();
    return res.reverse();
  },
  getOneGasto: async (_, { id }, { db }) => {
    const res = await db.collection("Gasto").findOne({ _id: ObjectId(id) });
    return res;
  },
  

  //USERS
  getOneUser: async (_, { id }, { db }) => {
    return await db.collection("User").findOne({ _id: ObjectId(id) });
  },
  getUser: async (_, __, { user }) => {
    return user;
  },
 


  //MENSAJES
  getMensajes: async (_, { marca }, { user, db }) => {
    const mensajes = await db
      .collection("Mensaje")
      .find({ marca: marca })
      .toArray();
    if (mensajes.length > 20) {
      const lastMessage = mensajes.shift();
      await db.collection("Mensaje").deleteOne({ _id: lastMessage._id });
      return mensajes;
    } else {
      return mensajes;
    }
  },

  getNegocios:async(_,__, {db})=>{
    const negocios = await db.collection('Negocios').find().toArray()
    return negocios
  },
  getAlmacenes:async(_,__,{db})=>{
    const negocios = await db.collection('Negocios').find({tipo:'Almacen'}).toArray()

    return negocios
  },
  getAlmacens:async(_,{split},{db})=>{
    const negocios = await db.collection('Negocios').find({tipo:'Almacen'}).limit(split).toArray()

    return negocios
  },
  getTalleres:async(_, __, {db})=>{
    const negocios = await db.collection('Negocios').find({tipo:'Taller'}).toArray()
    return negocios
  },
  getOneNegocio:async(_,{id}, {db})=>{
    const negocio = await db.collection('Negocios').findOne({ _id: ObjectId(id) });
    return negocio
  },


  //PRODUCTOS
  getProductos:async(_, __,{db})=>{
    const productos = await db.collection('Productos').find().toArray()
    return productos
  },
  getOneProducto:async(_,{id}, {db})=>{
    const negocio = await db.collection('Productos').findOne({ _id: ObjectId(id) });
    return negocio
  },


  //PREGUNTAS&&COTIZACIONES
  getPreguntas:async(_,{marca, limit},{db})=>{
    // db.collection('Preguntas').dropIndex( "marcas_text_titulo_text" )
    const preguntas = await db.collection('Preguntas').find({marca:marca}).sort({fecha:-1}).limit(limit).toArray()
    return preguntas
    // const preguntas = await db.collection('Preguntas').find({}).limit(7).toArray()
    // return preguntas
  },
  
  getOnePregunta:async(_,{id}, {db})=>{
    const pregunta = await db.collection('Preguntas').findOne({ _id: ObjectId(id) });
    return pregunta
  },
  getBusquedaPreguntas:async(_,{word}, {db})=>{
    console.log('lssasa',word);

    // const pregunta = await db.collection('Preguntas').find({marca:{$in:[word]}}).toArray()
    const pregunta2 = await db.collection('Preguntas')
                            .find({$text:{$search:word}},{score: { $meta: "textScore" } })
                            .sort( { score: { $meta: "textScore" } } )
                            .limit(8)
                            .toArray()
                           
    return pregunta2
  },

  getCotizaciones:async(_,{id}, {db})=>{
    const cotizaciones = await db.collection('Cotizacion').find({ pregunta: ObjectId(id) }).toArray();
    return cotizaciones
  },
  getCotizacionesUser:async(_,{id, limit}, {db})=>{
    const preguntas = await db.collection('Cotizacion').find({user:ObjectId(id)}).sort({fecha:-1}).limit(limit).toArray()
    return preguntas
  },
  getAvatar:async(_,{id}, {db})=>{
    const user = await db.collection('User').findOne({_id:ObjectId(id)})
    return user
  },
};

module.exports = querys;
