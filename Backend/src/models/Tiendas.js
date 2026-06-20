import mongoose from "mongoose"

const tiendasSchema = new mongoose.Schema({
    nombre: String,
    direccion: String,
    ciudad: String,
    telefono: String,
});

export default mongoose.model("Tiendas", tiendasSchema);