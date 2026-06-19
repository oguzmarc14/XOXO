import express from "express";
import Alertas from "../models/Alertas.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const alertas = await Alertas.find()
      .populate("tiendaId")
      .populate("productoId");

    return res.status(200).json(alertas);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener alertas",
      error: error.message,
    });
  }
});

export default router;