const { ObjectId } = require("mongodb");

const querys = {

  //CAR
  getCars: async (_, __, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    const cars = await db
      .collection("Vehicule")
      .find({ user: ObjectId(user._id) })
      .toArray();
    return cars;
  },

  //RECORDATORIOS
  getRecordatorios: async (_, { id }, { db }) => {
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
      .toArray();
    return res.reverse();
  },
  getOneGasto: async (_, { id }, { db }) => {
    const res = await db.collection("Gasto").findOne({ _id: ObjectId(id) });
    return res;
  },
  getGastosMonth: async (_, { id }, { db }) => {
    let MyDate = new Date();
    let MyDateString;
    MyDateString = MyDate.getFullYear() + '-' + ('0' + (MyDate.getMonth() + 1)).slice(-2)
    const collection = db.collection('Gasto')

    return collection.aggregate([
      {
        $match: {
          $and: [
            { vehiculo: id },
            { $expr: { $eq: [{ $dateToString: { format: "%Y-%m", date: "$fecha" } }, MyDateString] } }
          ]
        }
      }
    ]).toArray()
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

  getNegocios: async (_, __, { db }) => {
    const negocios = await db.collection('Negocios').find().toArray()
    return negocios
  },
  getAlmacenes: async (_, __, { db }) => {
    const negocios = await db.collection('Negocios').find({ tipo: 'Almacen' }).toArray()

    return negocios
  },
  getAlmacens: async (_, { split }, { db }) => {
    const negocios = await db.collection('Negocios').find({ tipo: 'Almacen' }).limit(split).toArray()

    return negocios
  },
  getTalleres: async (_, __, { db }) => {
    const negocios = await db.collection('Negocios').find({ tipo: 'Taller' }).toArray()
    return negocios
  },
  getOneNegocio: async (_, { id }, { db }) => {
    const negocio = await db.collection('Negocios').findOne({ _id: ObjectId(id) });
    return negocio
  },


  //PRODUCTOS
  getProductos: async (_, __, { db }) => {
    const productos = await db.collection('Productos').find().toArray()
    return productos
  },
  getOneProducto: async (_, { id }, { db }) => {
    const negocio = await db.collection('Productos').findOne({ _id: ObjectId(id) });
    return negocio
  },


  getPreguntas: async (_, { marca, limit }, { db }) => {
    const preguntas = await db.collection('Preguntas').find({ marca: marca }).sort({ fecha: -1 }).limit(limit).toArray()
    return preguntas

  },
  getLastPreguntas: async (_, { }, { db }) => {
    const preguntas = await db.collection('Preguntas').find().sort({ fecha: -1 }).limit(10).toArray()
    return preguntas

  },
  getPreguntasUser: async (_, { }, { db, user }) => {
    const idsPreguntas = user?.preguntas
    if (!idsPreguntas) throw new Error('No has realizado ninguna cotizacion aún, crea una')
    const preguntas = await db.collection('Preguntas').find({ _id: { $in: idsPreguntas } }).toArray()
    return preguntas.reverse()

  },

  getOnePregunta: async (_, { id }, { db }) => {
    const pregunta = await db.collection('Preguntas').findOne({ _id: ObjectId(id) });
    return pregunta
  },
  getBusquedaPreguntas: async (_, { word }, { db }) => {
    // const pregunta = await db.collection('Preguntas').find({marca:{$in:[word]}}).toArray()
    const pregunta2 = await db.collection('Preguntas')
      .find({ $text: { $search: word } }, { score: { $meta: "textScore" } })
      .sort({ score: { $meta: "textScore" } })
      .limit(8)
      .toArray()
    return pregunta2
  },

  getCotizaciones: async (_, { id }, { db }) => {
    const cotizaciones = await db.collection('Cotizacion').find({ pregunta: ObjectId(id) }).toArray();
    return cotizaciones
  },
  getCotizacionesUser: async (_, { id, limit }, { user, db, clientWha }) => {
    console.log('Hola a todos');
    let arrayVendedores = ['573143551942', '573114754394']

    for(let i = 0; i< arrayVendedores.length; i++){
      clientWha.sendMessage(`${arrayVendedores[i]}@c.us`, 'Hola lore, aqui tienes el link \n quarks.com.co/cotizaciones/641c5d462e31d51e85e456ec%20Kit%20embriage%20de%20Spark%20life').then(res => console.log('res', res)).catch(err => console.log('err', err))
    }
    const preguntas = await db.collection('Cotizacion').find({ user: ObjectId(id) }).sort({ fecha: -1 }).limit(limit).toArray()
    return preguntas
  },

  getAvatar: async (_, { id }, { db }) => {
    const user = await db.collection('User').findOne({ _id: ObjectId(id) })
    return user
  },


  getBatallas: async (_, { }, { db }) => {
    const batallas = await db.collection('Batallas').find().toArray()
    console.log(batallas);
    return batallas
  }
};

module.exports = querys;
