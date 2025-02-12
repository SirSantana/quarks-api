const mutations = require('./mutations');
const querys = require('./querys');
 
 
 const resolvers = {
    Query: querys,
    Mutation: mutations,
  
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
    Negocio:{
      id: ({ _id, id }) => _id || id,
    },
    Producto:{
      id: ({ _id, id }) => _id || id,
    },
    Pregunta:{
      id: ({ _id, id }) => _id || id,
    },
    Cotizacion:{
      id: ({ _id, id }) => _id || id,
    },
    Batalla:{
      id: ({ _id, id }) => _id || id,
    },
    Almacen:{
      id: ({ _id, id }) => _id || id,
    },
    Opinion:{
      id: ({ _id, id }) => _id || id,
    },
    Articulo:{
      id: ({ _id, id }) => _id || id,
    },
    NegocioVDos:{
      id: ({ _id, id }) => _id || id,
    },
    Revision:{
      id: ({ _id, id }) => _id || id,
    },
    Accion:{
      id: ({ _id, id }) => _id || id,
    },
    ReportePriceGasolinera:{
      id: ({ _id, id }) => _id || id,
    },
    TicketLavado:{
      id: ({ _id, id }) => _id || id,
    },
    Termino:{
      id: ({ _id, id }) => _id || id,
    }
  };

module.exports = resolvers