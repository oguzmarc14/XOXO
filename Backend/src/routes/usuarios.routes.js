import express from "express";
import Usuarios from "../models/Usuarios.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      usuario,
      password,
      rol,
      tiendaId,
      sexo,
    } = req.body;

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
      tiendaId: tiendaId || null,
      sexo: sexo || "HOMBRE",
    });

    const usuarioCompleto = await Usuarios.findById(nuevoUsuario._id)
      .populate("tiendaId", "nombre ciudad direccion telefono");

    return res.status(201).json({
      message: "Usuario creado correctamente",
      usuario: usuarioCompleto,
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
    const usuarios = await Usuarios.find()
      .populate("tiendaId", "nombre ciudad direccion telefono")
      .sort({ fechaCreacion: -1 });

    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener usuarios",
      error: error.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const usuario = await Usuarios.findById(req.params.id)
      .populate("tiendaId", "nombre ciudad direccion telefono");

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener usuario",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const {
      nombre,
      usuario,
      password,
      rol,
      sexo,
      tiendaId,
      activo,
    } = req.body;

    const datosActualizados = {};

    if (nombre !== undefined) {
      datosActualizados.nombre = nombre;
    }

    if (usuario !== undefined) {
      datosActualizados.usuario = usuario;
    }

    if (rol !== undefined) {
      datosActualizados.rol = rol;
    }

    if (sexo !== undefined) {
      datosActualizados.sexo = sexo;
    }

    if (tiendaId !== undefined) {
      datosActualizados.tiendaId = tiendaId || null;
    }

    if (activo !== undefined) {
      datosActualizados.activo = activo;
    }

    if (password) {
      datosActualizados.password = password;
    }

    const usuarioActualizado = await Usuarios.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      {
        new: true,
        runValidators: true,
      }
    ).populate("tiendaId", "nombre ciudad direccion telefono");

    if (!usuarioActualizado) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      message: "Usuario actualizado correctamente",
      usuario: usuarioActualizado,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al actualizar usuario",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const usuario = await Usuarios.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    await Usuarios.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "Usuario eliminado correctamente",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar usuario",
      error: error.message,
    });
  }
});

export default router;