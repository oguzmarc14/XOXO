import mongoose from "mongoose"

const ventaSchema = new mongoose.Schema({
   
    tiendaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tiendas",
        required: true
    },

    productos: [
        {
            productoId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Productos",
                required: true
            },
            piezas: {
                type: Number,
                required: true
            },
            precio: {
                type: Number,
                required: true
            }
        }
    ],

    total: {
        type: Number,
        required: true
    },

    fecha: {
        type: Date,
        default: Date.now
    }
});

export const Venta = mongoose.model("Venta", ventaSchema);