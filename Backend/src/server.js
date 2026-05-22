import express from "express";
import dotenv from "dotenv"
import { connectDB } from "./config/db.js";
import storesRoutes from "./routes/stores.routes.js"

dotenv.config();

const app = express();

app.use(express.json());
app.use("/stores", storesRoutes);

connectDB();

app.get("/", (req, res) => {
    res.send("API funcionando")
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});