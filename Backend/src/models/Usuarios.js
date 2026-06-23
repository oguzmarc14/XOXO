import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
  },
  usuario: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rol: {
    type: String,
    enum: ["ADMIN", "GERENTE", "CAJERO"],
    required: true,
  },
  sexo: {
    type: String,
    enum: ["HOMBRE", "MUJER"],
    default: "HOMBRE",
  },
  tiendaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tiendas",
    default: null,
  },
  activo: {
    type: Boolean,
    default: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Usuarios", usuarioSchema);