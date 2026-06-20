import express from "express";
import Usuarios from "../models/Usuarios.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        message: "Usuario y contraseña son requeridos",
      });
    }

    const usuarioEncontrado = await Usuarios.findOne({
      usuario,
      activo: true,
    }).populate("tiendaId");

    if (!usuarioEncontrado) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    if (usuarioEncontrado.password !== password) {
      return res.status(401).json({
        message: "Contraseña incorrecta",
      });
    }

    return res.status(200).json({
      message: "Login correcto",
      usuario: {
        id: usuarioEncontrado._id,
        nombre: usuarioEncontrado.nombre,
        usuario: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.rol,
        tiendaId: usuarioEncontrado.tiendaId,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
});

export default router;