import mongoose from "mongoose"

const tiendasSchema = new mongoose.Schema({
    nombre: String,
    direccion: String,
    ciudad: String,
    telefono: String,
});

export const Tiendas = mongoose.model("Tiendas", tiendasSchema);