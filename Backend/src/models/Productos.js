import mongoose from "mongoose"

const productosSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },

    precio: {
        type: Number, 
        required: true
    },

    categoria: {
        type: String,
        required: true
    },
})

export const Productos = mongoose.model("Productos", productosSchema);

