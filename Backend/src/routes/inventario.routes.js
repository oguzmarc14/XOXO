import express from "express";
import Inventario from "../models/Inventario.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const inventario = await Inventario.find()
      .populate("tiendaId", "nombre direccion ciudad telefono")
      .populate("productoId", "codigo nombre precio categoria stockMinimo")
      .sort({ createdAt: -1 });

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

    if (!tiendaId || !productoId) {
      return res.status(400).json({
        message: "La tienda y el producto son obligatorios",
      });
    }

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
      piezas: Number(piezas) || 0,
    });

    const inventarioCompleto = await Inventario.findById(inventario._id)
      .populate("tiendaId", "nombre direccion ciudad telefono")
      .populate("productoId", "codigo nombre precio categoria stockMinimo");

    return res.status(201).json(inventarioCompleto);
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear inventario",
      error: error.message,
    });
  }
});

router.get("/tienda/:tiendaId", async (req, res) => {
  try {
    const inventario = await Inventario.find({
      tiendaId: req.params.tiendaId,
    })
      .populate("tiendaId", "nombre direccion ciudad telefono")
      .populate("productoId", "codigo nombre precio categoria stockMinimo")
      .sort({ createdAt: -1 });

    return res.json(inventario);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener inventario de la tienda",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { piezas } = req.body;

    const inventario = await Inventario.findByIdAndUpdate(
      req.params.id,
      {
        piezas: Number(piezas) || 0,
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("tiendaId", "nombre direccion ciudad telefono")
      .populate("productoId", "codigo nombre precio categoria stockMinimo");

    if (!inventario) {
      return res.status(404).json({
        message: "Inventario no encontrado",
      });
    }

    return res.json(inventario);
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar inventario",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const inventario = await Inventario.findByIdAndDelete(req.params.id);

    if (!inventario) {
      return res.status(404).json({
        message: "Inventario no encontrado",
      });
    }

    return res.json({
      message: "Inventario eliminado correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar inventario",
      error: error.message,
    });
  }
});

export default router;