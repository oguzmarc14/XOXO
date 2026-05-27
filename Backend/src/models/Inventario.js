import mongoose from "mongoose"

const inventarioSchema = new mongoose.Schema({
    tiendaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },

    productoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Productos",
        required: true
    },

    piezas: {
        type: Number,
        default: 0
    }
})

export const Inventario = mongoose.model("Inventario", inventarioSchema);