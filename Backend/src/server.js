import express from "express";
import dotenv from "dotenv"
import { connectDB } from "./config/db.js";
import tiendasRoutes from "./routes/tiendas.routes.js"
import productosRoutes from "./routes/productos.routes.js"
import inventarioRoutes from "./routes/inventario.routes.js"
import turnosRoutes from "./routes/turnos.routes.js"
import usuariosRoutes from "./routes/usuarios.routes.js"
import authRoutes from "./routes/auth.routes.js"
import ventasRoutes from "./routes/ventas.routes.js"
import alertasRoutes from "./routes/alertas.routes.js"

dotenv.config();

const app = express();

app.use(express.json());

app.use("/tiendas", tiendasRoutes);
app.use("/productos", productosRoutes);
app.use("/inventario", inventarioRoutes );
app.use("/usuarios", usuariosRoutes);
app.use("/auth", authRoutes);
app.use("/turnos", turnosRoutes);
app.use("/ventas", ventasRoutes);
app.use("/alertas", alertasRoutes);

connectDB();

app.get("/", (req, res) => {
    res.send("API funcionando")
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});