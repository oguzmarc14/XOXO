import express from "express";
import Usuarios from "../models/Usuarios.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { nombre, usuario, password, rol, tiendaId } = req.body;

    if (!nombre || !usuario || !password || !rol) {
      return res.status(400).json({
        message: "Datos incompletos",
      });
    }

    const usuarioExistente = await Usuarios.findOne({ usuario });

    if (usuarioExistente) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }

    const nuevoUsuario = await Usuarios.create({
      nombre,
      usuario,
      password,
      rol,
      tiendaId,
    });

    return res.status(201).json({
      message: "Usuario creado correctamente",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear usuario",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuarios.find().populate("tiendaId");

    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
});

export default router;