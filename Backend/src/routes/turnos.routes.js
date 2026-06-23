import express from "express";
import mongoose from "mongoose";

import Turnos from "../models/Turnos.js";
import Usuarios from "../models/Usuarios.js";
import Tiendas from "../models/Tiendas.js";

const router = express.Router();

/*
  Abrir un turno.

  Se permiten varios turnos abiertos en una misma tienda,
  siempre que:

  - el cajero no tenga otro turno abierto;
  - la caja no tenga otro turno abierto en esa tienda.
*/
router.post("/abrir", async (req, res) => {
  try {
    const {
      tiendaId,
      usuarioId,
      numeroCaja,
      montoInicial
    } = req.body;

    if (
      !tiendaId ||
      !usuarioId ||
      numeroCaja === undefined ||
      numeroCaja === null ||
      montoInicial === undefined ||
      montoInicial === null
    ) {
      return res.status(400).json({
        message: "Datos incompletos"
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(tiendaId) ||
      !mongoose.Types.ObjectId.isValid(usuarioId)
    ) {
      return res.status(400).json({
        message:
          "El identificador de la tienda o del usuario no es válido"
      });
    }

    const numeroCajaNormalizado =
      Number(numeroCaja);

    const montoInicialNormalizado =
      Number(montoInicial);

    if (
      !Number.isInteger(numeroCajaNormalizado) ||
      numeroCajaNormalizado <= 0
    ) {
      return res.status(400).json({
        message:
          "El número de caja debe ser un entero mayor a cero"
      });
    }

    if (
      Number.isNaN(montoInicialNormalizado) ||
      montoInicialNormalizado < 0
    ) {
      return res.status(400).json({
        message:
          "El monto inicial no puede ser negativo"
      });
    }

    const tienda =
      await Tiendas.findById(tiendaId);

    if (!tienda) {
      return res.status(404).json({
        message: "La tienda no existe"
      });
    }

    const cajero =
      await Usuarios.findById(usuarioId);

    if (!cajero) {
      return res.status(404).json({
        message: "El cajero no existe"
      });
    }

    const rolCajero =
      String(cajero.rol)
        .toUpperCase();

    if (rolCajero !== "CAJERO") {
      return res.status(400).json({
        message:
          "El usuario seleccionado no tiene rol de cajero"
      });
    }

    if (cajero.activo === false) {
      return res.status(400).json({
        message:
          "El cajero seleccionado está inactivo"
      });
    }

    const tiendaCajero =
      cajero.tiendaId?.toString();

    if (
      !tiendaCajero ||
      tiendaCajero !== tiendaId
    ) {
      return res.status(400).json({
        message:
          "El cajero no pertenece a la tienda seleccionada"
      });
    }

    /*
      Impide que el mismo cajero tenga
      dos turnos abiertos simultáneamente.
    */
    const turnoAbiertoDelCajero =
      await Turnos.findOne({
        usuarioId,
        estado: "ABIERTO"
      });

    if (turnoAbiertoDelCajero) {
      return res.status(409).json({
        message:
          "Este cajero ya tiene un turno abierto"
      });
    }

    /*
      Impide que la misma caja tenga
      dos turnos abiertos en la misma tienda.
    */
    const cajaOcupada =
      await Turnos.findOne({
        tiendaId,
        numeroCaja:
          numeroCajaNormalizado,
        estado: "ABIERTO"
      });

    if (cajaOcupada) {
      return res.status(409).json({
        message:
          "Esta caja ya tiene un turno abierto"
      });
    }

    const turno =
      await Turnos.create({
        tiendaId,
        usuarioId,
        numeroCaja:
          numeroCajaNormalizado,
        montoInicial:
          montoInicialNormalizado
      });

    const turnoCompleto =
      await Turnos
        .findById(turno._id)
        .populate(
          "usuarioId",
          "nombre usuario rol activo tiendaId"
        )
        .populate(
          "tiendaId",
          "nombre ciudad direccion"
        );

    return res.status(201).json({
      message:
        "Turno abierto correctamente",
      turno:
        turnoCompleto
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Error al abrir turno",
      error:
        error.message
    });
  }
});

/*
  Cerrar un turno específico.
*/
router.put("/cerrar/:id", async (req, res) => {
  try {
    const {
      montoFinal
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "El identificador del turno no es válido"
      });
    }

    if (
      montoFinal === undefined ||
      montoFinal === null
    ) {
      return res.status(400).json({
        message:
          "El monto final es obligatorio"
      });
    }

    const montoFinalNormalizado =
      Number(montoFinal);

    if (
      Number.isNaN(
        montoFinalNormalizado
      ) ||
      montoFinalNormalizado < 0
    ) {
      return res.status(400).json({
        message:
          "El monto final no puede ser negativo"
      });
    }

    const turno =
      await Turnos.findById(
        req.params.id
      );

    if (!turno) {
      return res.status(404).json({
        message:
          "Turno no encontrado"
      });
    }

    if (
      turno.estado === "CERRADO"
    ) {
      return res.status(400).json({
        message:
          "El turno ya está cerrado"
      });
    }

    turno.montoFinal =
      montoFinalNormalizado;

    turno.estado =
      "CERRADO";

    turno.fechaCierre =
      new Date();

    await turno.save();

    const turnoCompleto =
      await Turnos
        .findById(turno._id)
        .populate(
          "usuarioId",
          "nombre usuario rol"
        )
        .populate(
          "tiendaId",
          "nombre ciudad direccion"
        );

    return res.status(200).json({
      message:
        "Turno cerrado correctamente",
      turno:
        turnoCompleto
    });
  } catch (error) {
    return res.status(500).json({
      message:
        "Error al cerrar turno",
      error:
        error.message
    });
  }
});

/*
  Obtener todos los turnos abiertos
  de una tienda.
*/
router.get(
  "/abiertos/:tiendaId",
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.tiendaId
        )
      ) {
        return res.status(400).json({
          message:
            "El identificador de la tienda no es válido"
        });
      }

      const turnos =
        await Turnos
          .find({
            tiendaId:
              req.params.tiendaId,
            estado:
              "ABIERTO"
          })
          .populate(
            "usuarioId",
            "nombre usuario rol activo"
          )
          .populate(
            "tiendaId",
            "nombre ciudad direccion"
          )
          .sort({
            fechaApertura: -1
          });

      return res
        .status(200)
        .json(turnos);
    } catch (error) {
      return res.status(500).json({
        message:
          "Error al obtener turnos abiertos",
        error:
          error.message
      });
    }
  }
);

export default router;