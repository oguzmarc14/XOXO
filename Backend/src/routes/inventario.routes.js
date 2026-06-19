import express from "express";
import Inventario from "../models/Inventario.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const inventario = await Inventario.find();

    res.json(inventario);
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener inventario",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { tiendaId, productoId, piezas } = req.body;

    const inventarioExistente = await Inventario.findOne({
      tiendaId,
      productoId,
    });

    if (inventarioExistente) {
      return res.status(400).json({
        message: "Este producto ya tiene inventario registrado en esta tienda",
      });
    }

    const inventario = await Inventario.create({
      tiendaId,
      productoId,
      piezas,
    });

    return res.status(201).json(inventario);

  } catch (error) {
    return res.status(500).json({
      message: "Error al crear inventario",
      error: error.message,
    });
  }
});

export default router;