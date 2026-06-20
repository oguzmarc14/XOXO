import express from "express";
import Turnos from "../models/Turnos.js";

const router = express.Router();

router.post("/abrir", async (req, res) => {
  try {
    const { tiendaId, usuarioId, numeroCaja, montoInicial } = req.body;

    if (!tiendaId || !usuarioId || !numeroCaja || montoInicial === undefined) {
      return res.status(400).json({
        message: "Datos incompletos",
      });
    }

    const turnoAbierto = await Turnos.findOne({
      tiendaId,
      numeroCaja,
      estado: "ABIERTO",
    });

    if (turnoAbierto) {
      return res.status(400).json({
        message: "Ya existe un turno abierto en esta caja",
      });
    }

    const turno = await Turnos.create({
      tiendaId,
      usuarioId,
      numeroCaja,
      montoInicial,
    });

    return res.status(201).json({
      message: "Turno abierto correctamente",
      turno,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al abrir turno",
      error: error.message,
    });
  }
});

router.put("/cerrar/:id", async (req, res) => {
  try {
    const { montoFinal } = req.body;

    const turno = await Turnos.findById(req.params.id);

    if (!turno) {
      return res.status(404).json({
        message: "Turno no encontrado",
      });
    }

    if (turno.estado === "CERRADO") {
      return res.status(400).json({
        message: "El turno ya está cerrado",
      });
    }

    turno.montoFinal = montoFinal;
    turno.estado = "CERRADO";
    turno.fechaCierre = new Date();

    await turno.save();

    return res.status(200).json({
      message: "Turno cerrado correctamente",
      turno,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al cerrar turno",
      error: error.message,
    });
  }
});

router.get("/abiertos/:tiendaId", async (req, res) => {
  try {
    const turnos = await Turnos.find({
      tiendaId: req.params.tiendaId,
      estado: "ABIERTO",
    }).populate("usuarioId");

    return res.status(200).json(turnos);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener turnos abiertos",
      error: error.message,
    });
  }
});

export default router;