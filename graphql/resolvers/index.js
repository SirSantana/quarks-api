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
  
  
  };

module.exports = resolvers