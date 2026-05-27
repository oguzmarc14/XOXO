import mongoose from "mongoose"

const productoSchema = new mongoose.Schema({
    storeId: {
        type: moongose.Schema.Types.ObjectId,
        ref: "Store",
        required: true
    },

    productId: {
        type: moongose.Schema.Types.ObjectId,
        ref: "Productos",
        required: true
    },

    stock: {
        type: Number,
        default: 0
    }
})