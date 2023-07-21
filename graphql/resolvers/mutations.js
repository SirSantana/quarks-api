const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { ObjectId } = require("mongodb");
const { getTemplate2, sendMail } = require('../../libs/mail');
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const AzureUpload = require('../../libs/azureUpload');
const Fetching = require('../fetching');


const getToken = (user) => jwt.sign({ id: user?._id }, process.env.JWT_TOKEN)

const mutations = {

  //USER/REGISTER/LOGIN
  editUser: async (_, { input }, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    const result = await db.collection("User").findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        $set: input,
      },
      {
        returnDocument: "after",
      }
    );
    return result.value;
  },
  editVendedor: async (_, { input }, { db, user }) => {
    if (!user) {
      return new Error("Authentication Error. Please sign in");
    }
    if (input?.avatar) {
      let container = process.env.AZURE_CONTAINER_IMGPROFILE
      let nameFile = new Date().getTime()
      await AzureUpload({ container, file: input.avatar, nameFile })
      const newInputImage = await { ...input, avatar: `https://${process.env.AZURE_ACCOUNT}.blob.core.windows.net/${container}/${nameFile}` }
      const result = await db.collection("User").findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          $set: newInputImage,
        },
        {
          returnDocument: "after",
        }
      )
      return result.value;
    } else {
      const result = await db.collection("User").findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          $set: input,
        },
        {
          returnDocument: "after",
        }
      );
      return result.value;
    }

  },
  signUp: async (_, { input }, { db, user }) => {
    try {
      const existUser = await db
        .collection("User")
        .findOne({ email: input.email });
      if (existUser) throw new Error("User already exist");
      if (input.password !== input.confirmPassword) {
        throw new Error("Datos Invalidos. Las contraseñas no coinciden");
      }
      const hashedPassword = bcrypt.hashSync(input.password);
      const newUser = {
        email: input.email,
        name: input.name,
        role: "Cliente",
        password: hashedPassword,
        puntos: 100
      };
      // save to database
      await db.collection("User").insertOne(newUser);
      const user = await db
        .collection("User")
        .findOne({ email: newUser.email });
      return {
        user,
        token: getToken(user),
      };
    } catch (error) {
      throw new Error(error);
    }
  },
  signUpWithoutEmail: async (_, { name }, { db }) => {
    const newUser = {
      name,
      role: "Cliente",
      puntos: 100
    };
    await db.collection("User").insertOne(newUser);
    const user = await db
      .collection("User")
      .findOne({ _id: newUser._id });
    return {
      user,
      token: getToken(user),
    };
  },
  addEmailUser: async (_, { input }, { db, user }) => {
    console.log(input);

    if (user?.email) {
      return new Error("No puedes cambiar esta informacion");
    }
    const existUser = await db
      .collection("User")
      .findOne({ email: input.email });
    if (existUser) throw new Error("Ya existe una cuenta con ese correo");
    try {
      if (input.password !== input.confirmPassword) {
        throw new Error("Datos Invalidos. Las contraseñas no coinciden");
      }
      const hashedPassword = bcrypt.hashSync(input.password);
      const newInput = {
        email: input.email,
        password: hashedPassword,
        puntos: user?.puntos + 100
      };
      // save to database
      const result = await db.collection("User").findOneAndUpdate(
        {
          _id: user._id,
        },
        {
          $set: newInput,
        },
        {
          returnDocument: "after",
        }
      );
      return result.value;
    } catch (error) {
      throw new Error(error);
    }
  },


  signIn: async (_, { input }, { db }) => {
    const user = await db.collection("User").findOne({ email: input.email });
    const isPasswordCorrect =
      user && bcrypt.compareSync(input.password, user.password);
    if (!user || !isPasswordCorrect) {
      throw new Error("Datos Invalidos. Revisa tu Correo y Contraseña");
    }
    if (user.role === 'Vendedor' && user?.verified === false) {
      return new Error("Estamos validando tu cuenta");
    }
    return {
      user,
      token: getToken(user),
    };
  },
  sendMessagePassword: async (_, { email, codigo }, { db }) => {
    const template = getTemplate2(codigo);
    const user = await db.collection("User").findOne({ email: email });
    if (!user) {
      throw new Error("Correo no registrado");
    }
    let mailOptions = {
      from: "quarkscolombia@gmail.com",
      to: email,
      subject: "Quarks",
      text: "Cambio de contraseña",
      htmL: null,
    };
    await sendMail(mailOptions, template);
    return 'true'

  },
  changePassword: async (_, { email, password, previusPassword }, { db, user }) => {
    console.log('Hola');
    console.log(email, password, previusPassword);
    if (!user) {
      return new Error("Authentication Error. Please sign in");
    }
    const isValid = await bcrypt.compare(previusPassword, user?.password)
    if (!isValid) {
      return new Error("Contraseña anterior invalida");
    }
    const hashedPassword = bcrypt.hashSync(password);
    const result = await db.collection("User").findOneAndUpdate(
      {
        email: user?.email,
      },
      {
        $set: {
          password: hashedPassword
        },
      },
      {
        returnDocument: "after",
      }
    );
    return result.ok
  },

  //CAR
  createCar: async (_, { input }, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    let newInputImage;
    if (input?.imagen) {
      let container = process.env.AZURE_CONTAINER_CARS
      let nameFile = new Date().getTime()
      await AzureUpload({ container, file: input.imagen, nameFile })
      newInputImage = await { ...input, imagen: `https://${process.env.AZURE_ACCOUNT}.blob.core.windows.net/${container}/${nameFile}`, user: user._id, tipo: 'Carro' }
      await db.collection("Vehicule").insertOne(newInputImage);
      db.collection("User").updateOne(
        {
          _id: ObjectId(user._id),
        },
        {
          $set: { puntos: user?.puntos ? user?.puntos + 50 : 0 + 50 },
          $push: {
            vehiculos: newInputImage._id,
          },
        }
      );
      return newInputImage;
    } else {
      const newCar = { ...input, user: user._id, tipo: 'Carro' };
      await db.collection("Vehicule").insertOne(newCar);
      db.collection("User").updateOne(
        {
          _id: ObjectId(user._id),
        },
        {
          $set: { puntos: user?.puntos ? user?.puntos + 50 : 0 + 50 },
          $push: {
            vehiculos: newCar._id,
          },
        }
      );
      return newCar;
    }


  },
  updateCar: async (_, { input }, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    let newInputImage;
    if (input?.imagen) {
      let container = process.env.AZURE_CONTAINER_CARS
      let nameFile = new Date().getTime()
      await AzureUpload({ container, file: input.imagen, nameFile })
      newInputImage = await { ...input, imagen: `https://${process.env.AZURE_ACCOUNT}.blob.core.windows.net/${container}/${nameFile}` }
      const result = await db.collection("Vehicule").findOneAndUpdate(
        {
          _id: ObjectId(input.id),
        },
        {
          $set: newInputImage,
        },
        {
          returnDocument: "after",
        }
      );
      return result.value;
    } else {
      const result = await db.collection("Vehicule").findOneAndUpdate(
        {
          _id: ObjectId(input.id),
        },
        {
          $set: input,
        },
        {
          returnDocument: "after",
        }
      );
      return result.value;
    }
  },
  deleteCar: async (_, { id }, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    try {
      await db.collection("Vehicule").deleteOne({ _id: ObjectId(id) });
      await db
        .collection("User")
        .updateOne(
          { _id: ObjectId(user?._id) },
          {
            $set: { puntos: user?.puntos - 50 },
            $pull: { vehiculos: ObjectId(id) },
          },
        );
      return id;
    } catch (error) {
      throw new Error("Ha ocurrido un error");
    }
  },

  //GASTO
  createGasto: async (_, { input }, { db, user }) => {
    const { fecha, tipo, dineroGastado } = input;
    if (tipo.length === 0) {
      input.tipo = "Tanqueada";
    }
    if (fecha == "Invalid Date") {
      input.fecha = new Date();
    }
    let newInput = {
      ...input,
      dineroGastado: input.dineroGastado.replace(/[^0-9]/g, ""),
    };

    if (dineroGastado.length === 0) {
      throw new Error("Debes agregar fecha, tipo y dinero gastado");
    }
    if (input.imagen) {
      let container = process.env.AZURE_CONTAINER_GASTOS
      let nameFile = new Date().getTime()
      await AzureUpload({ container, file: input.imagen, nameFile })
      newInput = await { ...input, imagen: `https://${process.env.AZURE_ACCOUNT}.blob.core.windows.net/${container}/${nameFile}` }
    }
    const res = await db
      .collection("Gasto")
      .insertOne(newInput)
      .then((result) =>
        db.collection("Gasto").findOne({ _id: result.insertedId })
      );
    db.collection("Vehicule").updateOne(
      {
        _id: ObjectId(input.vehiculo),
      },
      {
        $push: {
          gastos: res._id,
        },
      }
    );
    db.collection("User").updateOne(
      {
        _id: ObjectId(user._id),
      },
      {
        $set: { puntos: user?.puntos && user?.puntos + 2 },
      }
    );
    return res;
  },
  updateGasto: async (_, data, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    const { input } = data;
    let newInput;
    if (input.imagen) {
      let container = process.env.AZURE_CONTAINER_GASTOS
      let nameFile = new Date().getTime()
      await AzureUpload({ container, file: input.imagen, nameFile })
      newInput = await { ...input, imagen: `https://${process.env.AZURE_ACCOUNT}.blob.core.windows.net/${container}/${nameFile}` }
    }
    const result = await db.collection("Gasto").findOneAndUpdate(
      {
        _id: ObjectId(input.id),
      },
      {
        $set: newInput ? newInput : input,
      },
      {
        returnDocument: "after",
      }
    );
    return result.value;
  },
  createPresupuesto: async (_, { id, presupuesto }, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    db.collection("Vehicule").updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $set: { presupuesto: presupuesto },
      }
    )
  },
  deleteGasto: async (_, { id, idVehiculo }, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    try {
      await db.collection("Gasto").deleteOne({ _id: ObjectId(id) });
      await db
        .collection("Vehicule")
        .updateOne(
          { _id: ObjectId(idVehiculo) },
          { $pull: { gastos: ObjectId(id) } }
        );
      return id;
    } catch (error) {
      throw new Error("Ha ocurrido un error");
    }
  },

  //RECORDATORIO
  createRecordatorio: async (_, { input }, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    const newRecordatorio = { ...input };
    await db.collection("Recordatorio").insertOne(newRecordatorio);
    db.collection("Vehicule").updateOne(
      {
        _id: ObjectId(input.vehiculo),
      },
      {
        $push: {
          recordatorio: newRecordatorio._id,
        },
      }
    );
    return newRecordatorio;
  },
  editRecordatorio: async (_, { input }, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    const result = await db.collection("Recordatorio").findOneAndUpdate(
      {
        _id: ObjectId(input.id),
      },
      {
        $set: input,
      },
      {
        returnDocument: "after",
      }
    );

    return result.value;
  },
  deleteRecordatorio: async (_, { id }, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    try {
      await db.collection("Recordatorio").deleteOne({ _id: ObjectId(id) });
      await db
        .collection("Vehicule")
        .updateOne(
          { recordatorio: ObjectId(id) },
          { $pull: { recordatorio: ObjectId(id) } }
        );
      return id;
    } catch (error) {
      throw new Error("Ha ocurrido un error");
    }
  },

  //MENSAJE
  createMensaje: async (_, { input }, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    const newMensaje = {
      ...input,
      user: user?._id,
      name: user?.name,
      avatar: user?.avatar,
    };
    await db.collection("Mensaje").insertOne(newMensaje);

    return newMensaje;
  },


  //PREGUNTA
  createPregunta: async (_, { input }, { db, user }) => {
    const newInput = { ...input, fecha: new Date(), titulo: input.titulo + " de " + input.referencia, user: user?._id ? ObjectId(user?._id) : '' }
    let newInputImage;
    let res;
    if (input?.imagen) {
      let container = process.env.AZURE_CONTAINER_PARTS
      let nameFile = new Date().getTime()
      await AzureUpload({ container, file: input.imagen, nameFile })
      newInputImage = await { ...newInput, imagen: `https://${process.env.AZURE_ACCOUNT}.blob.core.windows.net/${container}/${nameFile}` }
      res = await db
        .collection("Preguntas")
        .insertOne(newInputImage)
      return newInputImage

    } else {
      res = await db
        .collection("Preguntas")
        .insertOne(newInput)
      return newInput
    }
    // if (res) {
    //   let url = `quarks.com.co/cotizaciones/${res.insertedId}-${newInput?.titulo.split(" ").join('-')}`
    //   let frase = `😁 Haz recibido una cotizacion! \n🚘 ${newInput?.titulo} \n✍️ Cotiza en el siguiente link: \n` + url
    //   // 
    //   let arrayVendedores = ['573114754394', '573138562763', '573143551942']

    //   for (let i = 0; i < arrayVendedores.length; i++) {
    //     console.log(i);
    //     await Fetching(frase, arrayVendedores[i])
    //   }

    // }
    // if (user) {
    //   db.collection("User").updateOne(
    //     {
    //       _id: ObjectId(user._id),
    //     },
    //     {
    //       $set: { puntos: user?.puntos + 2 },
    //       $push: {
    //         preguntas: newInput._id ? newInput._id : newInputImage._id,
    //       },
    //     }
    //   );
    // }


  },

  //COTIZACION
  createCotizacion: async (_, { input }, { db, user }) => {
    if (user?.role !== 'Vendedor') {
      throw new Error("No tienes permiso para cotizar");
    }
    console.log(input);
    const newInput = { ...input, fecha: new Date(), pregunta: ObjectId(input.pregunta), user: user._id, celular: user?.celular, }
    await db.collection("Cotizacion").insertOne(newInput);
    console.log('Hola');

    db.collection("Preguntas").updateOne(
      {
        _id: ObjectId(input.pregunta),
      },
      {
        $push: {
          cotizaciones: newInput._id,
        },
      }
    )
    await db.collection("User").updateOne(
      {
        _id: ObjectId(user._id),
      },
      {
        $push: {
          cotizaciones: newInput._id,
        },
      }
    )
    return newInput
  },
  // VENDEDOR
  createVendedor: async (_, { input }, { db }) => {
    try {
      const existUser = await db
        .collection("User")
        .findOne({ email: input.email });
      if (existUser) throw new Error("User already exist");
      const hashedPassword = bcrypt.hashSync(input.password);
      const newVendedor = {
        ...input,
        password: hashedPassword,
        role: "Vendedor",
      };
      await db.collection("User").insertOne(newVendedor);
    } catch (error) {
      return new Error(error);
    }
  },


  userRecurrent: async (_, __, { db, user }) => {
    await db.collection("User").updateOne(
      {
        _id: ObjectId(user._id),
      },
      {
        $push: {
          recurrent: new Date().toLocaleString(),
        },
      }
    )
  },
  contactoEmail: async (_, { name, email, mensaje }, { db, user }) => {
    console.log(name, email, mensaje);
  },


  createVote: async (_, { id, idCarro }, { db }) => {

    const votos = await db.collection("Batallas").findOne({ _id: ObjectId(id) })
    if (votos.carroUnoId == idCarro) {
      db.collection("Batallas").updateOne(
        {
          _id: ObjectId(id),
        },
        {
          $set: { carroUnoVotos: votos.carroUnoVotos + 1 },
        }
      );
    } else {
      db.collection("Batallas").updateOne(
        {
          _id: ObjectId(id),
        },
        {
          $set: { carroDosVotos: votos.carroDosVotos + 1 },

        }
      );
    }



  },

  interesadoPremium: async (_, { celular }, { db, user }) => {
    const data = { celular, email: user?.email }
    await db.collection("Interesado").insertOne(data);
  },
  createOpinion: async (_, { input }, { db }) => {
    const newInput = { ...input, fecha: new Date() }
    await db.collection("Opinion").insertOne(newInput);
    await db.collection("NegocioVDos").updateOne(
      {
        _id: ObjectId(input.almacen),
      },
      {
        $push: {
          opiniones: newInput._id,
        },
      }
    )
    return newInput
  },
  createVisitaAlmacen: async (_, { id }, { db }) => {
    await db.collection("NegocioVDos").updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $inc: { visitas: 1 },
      }
    );
  },
  createImpresionAlmacen: async (_, { id }, { db }) => {
    await db.collection("NegocioVDos").updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $inc: { impresion: 1 },
      }
    )

  },
  interesadoAlmacen: async (_, { name, celular, almacen }, { db }) => {
    await db.collection("Almacenes").updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $inc: { visitas: 1 },
      }
    );
  },
  interesadoAnuncio: async (_, { name, celular, }, { db }) => {
    const data = { name, celular, fecha: new Date() }
    await db.collection("Interesadoanuncio").insertOne(data);

  },
  createVistaArticulo: async (_, { id }, { db }) => {
    await db.collection("Articulos").updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $inc: { vistas: 1 },
      }
    )

  },
  createVisitaWhatsapp: async (_, { id }, { db }) => {
    await db.collection("NegocioVDos").updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $inc: { visitaswhatsapp: 1 },
      }
    );
  },
  createClickMapaDireccion: async (_, { id }, { db }) => {
    await db.collection("NegocioVDos").updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $inc: { visitasmapa: 1 },
      }
    );
  },
  createClickTelefono: async (_, { id }, { db }) => {
    await db.collection("NegocioVDos").updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $inc: { vecestelefono: 1 },
      }
    );
  },
  createClickCompartido: async (_, { id }, { db }) => {
    await db.collection("NegocioVDos").updateOne(
      {
        _id: ObjectId(id),
      },
      {
        $inc: { vecescompartido: 1 },
      }
    );
  },
  createTaller: async (_, { input}, { db }) => {
    const newInput = { ...input, fecha: new Date(), ciudad:'Bogota', pais:'Colombia', paginaweb:'', fotoPerfil:'', facebook:'',visitas:1,acercanegocio:'',fotossecundarias:'', sponsored:0, nivelnegocio:'0',visitaswhatsapp:0, ubicacionmaps:'',impresion:1, opiniones:[] }
    await db.collection("NegocioVDos").insertOne(newInput);
    return newInput
  },
  
};
module.exports = mutations