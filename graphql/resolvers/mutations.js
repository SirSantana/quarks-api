const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { ObjectId } = require("mongodb");



const getToken=(user)=> jwt.sign({id:user?._id}, process.env.JWT_TOKEN)

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
    const user = await db.collection("User").findOne({ email: input.email });
    const isPasswordCorrect =
      user && bcrypt.compareSync(input.password, user.password);
    if (!user || !isPasswordCorrect) {
      throw new Error("Datos Invalidos. Revisa tu Correo y Contraseña");
    }

    return {
      user,
      token: getToken(user),
    };
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
    console.log("dataaaaa", input);
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
    console.log("da", input);
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
    console.log(id, idVehiculo);
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
    const newRecordatorio = { ...input, user: user._id };
    await db.collection("Recordatorio").insertOne(newRecordatorio);
    db.collection("User").updateOne(
      {
        _id: ObjectId(user._id),
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
    console.log(id, user._id);
    try {
      await db.collection("Recordatorio").deleteOne({ _id: ObjectId(id) });
      await db
        .collection("User")
        .updateOne(
          { _id: ObjectId(user._id) },
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
  
};
module.exports = mutations