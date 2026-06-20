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

router.put("/resolver/:id", async (req, res) => {
  try {
    const alerta = await Alertas.findById(req.params.id);

    if (!alerta) {
      return res.status(404).json({
        message: "Alerta no encontrada",
      });
    }

    alerta.estado = "RESUELTA";
    alerta.fechaResolucion = new Date();

    await alerta.save();

    return res.status(200).json({
      message: "Alerta resuelta correctamente",
      alerta,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al resolver alerta",
      error: error.message,
    });
  }
});

export default router;