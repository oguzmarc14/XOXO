import mongoose from "mongoose"

const storeSchema = new mongoose.Schema({
    nombre: String,
    direccion: String,
    ciudad: String,
    telefono: String,
});

export const Store = mongoose.model("Store", storeSchema);