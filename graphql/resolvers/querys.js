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
    return cars.reverse();
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
      .limit(5)
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


  //SCORE
  getScore: async (_, __, { db }) => {
    return await db.collection('User').find().sort({ "puntos": -1 }).limit(10).toArray()
  },


  //USERS
  getOneUser: async (_, { id }, { db }) => {
    return await db.collection("User").findOne({ _id: ObjectId(id) });
  },
  getUser: async (_, __, { user }) => {
    try {
      return user;
    } catch (error) {
      // Manejar errores y lanzar un error GraphQL
      return new Error('No se pudo obtener el usuario');
    }
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
  getAlmacenes: async (_, __, { db, user }) => {
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
    const preguntas = await db.collection('Preguntas').find().sort({ fecha: -1 }).limit(8).toArray()
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
  getCotizacionesUser: async (_, { id, limit }, { user, db, }) => {
    const preguntas = await db.collection('Cotizacion').find({ user: ObjectId(id) }).sort({ fecha: -1 }).limit(limit).toArray()
    return preguntas
  },

  getAvatar: async (_, { id }, { db }) => {
    const user = await db.collection('User').findOne({ _id: ObjectId(id) })
    return user
  },


  getBatallas: async (_, { }, { db }) => {
    const batallas = await db.collection('Batallas').find().toArray()
    return batallas
  },

  getAlmacenesRepuestos: async (_, { id }, { db }) => {
    const almacenes = await db
      .collection("Almacenes")
      .find()
      .sort({ fecha: 1 })
      .toArray();
    return almacenes;
  },
  getAlmacenRepuestos: async (_, { id }, { db }) => {
    const almacen = await db
      .collection("Almacenes")
      .findOne({ _id: ObjectId(id) })
    return almacen;
  },
  getBusquedaAlmacenes: async (_, { categoria, marca }, { db }) => {
    const almacenes = await db.collection('Almacenes').aggregate([
      { $project: { _id: 1, marcas: 1, categorias: 1, ciudad: 1, fotoperfil: 1, barrio: 1, nombre: 1, cantMarcas: { $size: "$marcas" }, cantCategorias: { $size: "$categorias" } } },
      {
        $match: {
          $and: [
            { marcas: { $in: [marca] } },
            { categorias: { $in: [categoria] } }
          ]
        }
      },
      { $sort: { cantCategorias: 1 } }
    ]).toArray()
    return almacenes

  },
  getAlmacenesByCategoria: async (_, { categoria }, { db }) => {
    const almacenes = await db.collection('Almacenes').aggregate([
      { $project: { _id: 1, marcas: 1, categorias: 1, ciudad: 1, fotoperfil: 1, barrio: 1, nombre: 1, cantMarcas: { $size: "$marcas" }, cantCategorias: { $size: "$categorias" } } },
      {
        $match: {
          $and: [
            { categorias: { $in: [categoria] } }
          ]
        }
      },
      { $sort: { cantCategorias: 1 } }]).toArray()
    return almacenes

  },
  getAlmacenesRecomendados: async (_, __, { db }) => {
    const almacenes = await db.collection('Almacenes').find({ recomendado: true }).toArray()
    return almacenes

  },
  getOpiniones: async (_, { id }, { db }) => {
    const opiniones = await db.collection('Opinion').find({
      $or: [
        { almacen: ObjectId(id) },
        { almacen: id } // Puedes agregar más condiciones si es necesario
      ]
    }).sort({ fecha: -1 }).toArray()
    return opiniones

  },
  getRevisiones: async (_, { id }, { db }) => {
    const revisiones = await db.collection('Revision').find({ almacen: ObjectId(id) }).sort({ fecha: -1 }).toArray()
    return revisiones

  },
  getWhatsappNegocio: async (_, { id }, { db }) => {
    const taller = await db.collection('NegocioVDos').findOne({ _id: ObjectId(id) })
    return taller.whatsapp

  },
  getCalificacionOpiniones: async (_, { id }, { db }) => {
    const opiniones = await db.collection('Opinion').find({
      $or: [
        { almacen: ObjectId(id) },
        { almacen: id } // Puedes agregar más condiciones si es necesario
      ]
    }).toArray()
    const taller = await db.collection('NegocioVDos').findOne({ _id: ObjectId(id) })


    let calificacionQuarks = 0
    let opinionesQuarks = 0
    for (let i = 0; i < opiniones.length; i++) {
      if (opiniones[i]?.email.length > 0) {
        calificacionQuarks += opiniones[i].calificacion
        opinionesQuarks += 1
      }
    }
    let promedioQuarks = calificacionQuarks ?? 1 / opinionesQuarks ?? 1
    const sumaPromedio = (promedioQuarks ?? 0 * opinionesQuarks ?? 0) + (parseFloat(taller?.promediocalificacionesmaps ?? 0) * parseFloat(taller?.numerocalificacionesmaps ?? 0));
    const sumaTotalNumeros = opinionesQuarks + parseFloat(taller?.numerocalificacionesmaps ?? 0);
    const promedioTotal = sumaPromedio / sumaTotalNumeros;
    if (promedioTotal > 0) {
      return promedioTotal.toFixed(1)
    } else {
      return 0
    }

  },

  getAllArticulos: async (_, __, { db }) => {
    const articulos = await db
      .collection("Articulos")
      .find()
      .toArray();
    return articulos;
  },
  getArticulosBlog: async (_, __, { db }) => {
    const articulos = await db
      .collection("Articulos")
      .find({ blog: true })
      .toArray();

    return articulos;
  },
  getArticulo: async (_, { id }, { db }) => {
    const articulo = await db
      .collection("Articulos")
      .findOne({ _id: ObjectId(id) })
    return articulo;
  },
  getVistasArticulo: async (_, { id }, { db }) => {
    const vistasArticulo = await db
      .collection("Articulos")
      .findOne({ _id: ObjectId(id) }, { vistas: 1, _id: 0 })
    return vistasArticulo.vistas
  },

  //NEGOCIOV2
  getNegocioVDos: async (_, { id }, { db }) => {
    const negociosVDos = await db
      .collection("NegocioVDos")
      .find()
      .toArray();
    return negociosVDos
  },
  getOneNegocioVDos: async (_, { userName }, { db }) => {
    const negociosVDos = await db
      .collection("NegocioVDos")
      .findOne({ userName: userName })
    return negociosVDos
  },
  getNegocioVDosByEmail: async (_, { email }, { db }) => {

    const negociosVDos = await db
      .collection("NegocioVDos")
      .findOne({ email: email })
    return negociosVDos.userName
  },
  getNegocioVDosByEmailDos: async (_, { email }, { db }) => {
    const negociosVDos = await db
      .collection("NegocioVDos")
      .findOne({ email: email })
    return negociosVDos
  },
  getNegociosVDosByTipo: async (_, {tipo}, {db,  }) => {
    const negociosVDos = await db.collection('NegocioVDos').find({tipo: tipo}).toArray()
    console.log(negociosVDos, 'neg');
    return negociosVDos;
  },
  getNegociosVDosByServicio: async (_, {tipo}, {db,  }) => {
    const tipoRegex = new RegExp(tipo, 'i');
    console.log(tipo, 'tipo');
    // const negociosVDos = await db.collection('NegocioVDos').find({tipo: tipo}).toArray()
    const negociosVDos = await db.collection('NegocioVDos').find({
      $or: [
        { tipo: tipoRegex },
        { categorias: { $regex: tipoRegex } },
        { nombre: { $regex: tipoRegex } },
        { marcasAutos: { $in: [tipoRegex] } }

      ]
    }).toArray()
    console.log(negociosVDos, 'neg');
    return negociosVDos;
  },
  getStadisticsHalfMonth: async (_, { id }, { db }) => {
    const negociosVDos = await db
      .collection("NegocioVDos")
      .findOne({ _id: ObjectId(id) })
    return negociosVDos
  },
  getConsumos: async (_, { id }, { db }) => {
    const consumos = await db
      .collection("Consumo")
      .find()
      .sort({ id: 1 })
      .limit(20)
      .toArray();
    return consumos
  },
  verifyAccountCheck: async (_, { userName }, { db, negocio }) => {
    let usernameParse = userName.replace(/\s/g, '-').toLowerCase()
    const isCreated = await db.collection("NegocioVDos").findOne({ userName: usernameParse })
    if (isCreated) {
      return true
    }
    return false
  },
  getNegocioVDosOne: async (_, __, { negocio }) => {
    return negocio;
  },
 
  getServiciosNegocio: async (_, { id }, { negocio }) => {
  },
  getAllAdminAccion: async (_, __, { db }) => {
    const Acciones = await db
      .collection("Accion")
      .find()
      .sort({ fecha: -1 })
      .toArray();
    return Acciones
  },

  //HACER UN GET Y FILTRAR POR EL TIPO CDA
  getReportsPrice: async (_, { gasolinera }, { db }) => {
    const reporteCorriente = await db
      .collection("ReportePriceGasolinera")
      .find({ gasolinera: gasolinera, combustible: 'Corriente' })
      .sort({ fecha: -1 })
      .limit(1)
      .toArray();

    const reporteExtra = await db
      .collection("ReportePriceGasolinera")
      .find({ gasolinera: gasolinera, combustible: 'Extra' })
      .sort({ fecha: -1 })
      .limit(1)
      .toArray();

    const reportes = [
      reporteCorriente[0] || null,
      reporteExtra[0] || null
    ];

    return reportes;
  },
  getTicketsNegocio: async (_, {negocio}, { db }) => {
    const Lavadas = await db
      .collection("TicketLavado")
      .find({ negocio: ObjectId(negocio)})
      .sort({ fecha: -1 })
      .toArray();
    return Lavadas
  },
  getTicketLavado: async (_, {id}, { db }) => {
    const Lavada = await db
      .collection("TicketLavado")
      .findOne({ _id: ObjectId(id)})
    return Lavada
  },
};

module.exports = querys;
