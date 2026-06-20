import mongoose from "mongoose"

const inventarioSchema = new mongoose.Schema({
    tiendaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tiendas",
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

export default mongoose.model("Inventario", inventarioSchema);