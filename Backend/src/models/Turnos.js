import mongoose from "mongoose";

const turnoSchema = new mongoose.Schema({
  tiendaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tiendas",
    required: true,
  },

  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuarios",
    required: true,
  },

  numeroCaja: {
    type: Number,
    required: true,
  },

  montoInicial: {
    type: Number,
    required: true,
  },

  montoFinal: {
    type: Number,
    default: 0,
  },

  estado: {
    type: String,
    enum: ["ABIERTO", "CERRADO"],
    default: "ABIERTO",
  },

  fechaApertura: {
    type: Date,
    default: Date.now,
  },

  fechaCierre: {
    type: Date,
  },
});

export default mongoose.model("Turnos", turnoSchema);