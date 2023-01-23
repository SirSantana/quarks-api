const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { ObjectId } = require("mongodb");
const { getTemplate2, sendMail } = require('../../libs/mail');
const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const AzureUpload = require('../../libs/azureUpload');


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
        apellido: input.apellido,
        role: "Cliente",
        password: hashedPassword,
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
      console.log(error);
      throw new Error(error);
    }
  },
  signIn: async (_, { input }, { db }) => {
    console.log(input);
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
  changePassword: async (_, { email, password, confirmPassword }, { db }) => {


    const user = await db.collection("User").findOne({ email: email });
    const hashedPassword = bcrypt.hashSync(password);

    if (!user) {
      throw new Error("Correo no registrado");
    }
    const result = await db.collection("User").findOneAndUpdate(
      {
        email: email,
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

    const newCar = { ...input, user: user._id };
    await db.collection("Vehicule").insertOne(newCar);
    db.collection("User").updateOne(
      {
        _id: ObjectId(user._id),
      },
      {
        $push: {
          vehiculos: newCar._id,
        },
      }
    );
    return newCar;
  },
  updateCar: async (_, data, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    const { input } = data;
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
    //  const res = await db.collection('Vehicule').findOne({ _id: ObjectId(input.id) });
    return result.value;
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
    const newInput = {
      ...input,
      dineroGastado: input.dineroGastado.replace(/[^0-9]/g, ""),
    };

    if (dineroGastado.length === 0) {
      throw new Error("Debes agregar fecha, tipo y dinero gastado");
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
    return res;
  },
  updateGasto: async (_, data, { db, user }) => {
    if (!user) {
      throw new Error("Authentication Error. Please sign in");
    }
    const { input } = data;
    const result = await db.collection("Gasto").findOneAndUpdate(
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
    //  const res = await db.collection('Vehicule').findOne({ _id: ObjectId(input.id) });
    return result.value;
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
    console.log('inpu', input);
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
  createPregunta: async (_, { input }, { db }) => {
    const newInput = { ...input, fecha: new Date(), titulo: input.titulo + " de " + input.referencia }
    if (input?.imagen) {
      let container = process.env.AZURE_CONTAINER_PARTS
      let nameFile = new Date().getTime()
      await AzureUpload({ container, file: input.imagen, nameFile })
      const newInputImage = await { ...newInput, imagen: `https://${process.env.AZURE_ACCOUNT}.blob.core.windows.net/${container}/${nameFile}` }
      await db
        .collection("Preguntas")
        .insertOne(newInputImage)
    } else {
      const res = await db
        .collection("Preguntas")
        .insertOne(newInput)
    }

  },

  //COTIZACION
  createCotizacion: async (_, { input }, { db, user }) => {
    const newInput = { ...input, fecha: new Date(), pregunta: ObjectId(input.pregunta), user: user._id, celular: user?.celular, }
    await db.collection("Cotizacion").insertOne(newInput);

    //VERIFICAR SI CON EL AWAIT FUNCIONA, HACER 20 PRUEBAS DE COTIZACIONES A LAS 5AM
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
      // save to database
      await db.collection("User").insertOne(newVendedor);

    } catch (error) {
      return new Error(error);
    }

  },

};
module.exports = mutations