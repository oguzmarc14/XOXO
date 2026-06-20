import mongoose from "mongoose";

const alertaSchema = new mongoose.Schema({
  tiendaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tiendas",
    required: true,
  },
  productoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Productos",
    required: true,
  },
  ventaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ventas",
  },
  tipo: {
    type: String,
    default: "STOCK_NEGATIVO",
  },
  mensaje: {
    type: String,
    required: true,
  },
  stockAnterior: {
    type: Number,
    required: true,
  },
  cantidadVendida: {
    type: Number,
    required: true,
  },
  stockNuevo: {
    type: Number,
    required: true,
  },
  estado: {
    type: String,
    enum: ["PENDIENTE", "RESUELTA"],
    default: "PENDIENTE",
  },
  fechaResolucion: {
    type: Date,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Alertas", alertaSchema);