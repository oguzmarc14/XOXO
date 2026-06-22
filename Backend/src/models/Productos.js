import mongoose from "mongoose";

const productosSchema = new mongoose.Schema({
  codigo: {
    type: Number,
    required: true,
    unique: true,
  },

  nombre: {
    type: String,
    required: true,
  },

  precio: {
    type: Number,
    required: true,
  },

  categoria: {
    type: String,
    required: true,
  },

  stockMinimo: {
    type: Number,
    required: true,
    default: 5,
  },
});

export default mongoose.model("Productos", productosSchema);