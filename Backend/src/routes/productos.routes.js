import express from "express";
import mongoose from "mongoose";

import Productos from "../models/Productos.js";
import Tiendas from "../models/Tiendas.js";

const router = express.Router();

/*
  GET /productos

  Administrador:
  GET /productos

  Gerente o cajero:
  GET /productos?tiendaId=ID_DE_TIENDA
*/
router.get("/", async (req, res) => {
  try {
    const filtro = {};

    if (req.query.tiendaId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.query.tiendaId
        )
      ) {
        return res.status(400).json({
          message:
            "El identificador de la tienda no es válido"
        });
      }

      filtro.tiendaId =
        req.query.tiendaId;
    }

    const productos =
      await Productos
        .find(filtro)
        .populate(
          "tiendaId",
          "nombre direccion ciudad telefono"
        )
        .sort({
          nombre: 1
        });

    res.json(productos);
  } catch (error) {
    res.status(500).json({
      message:
        "Error al obtener productos",

      error:
        error.message
    });
  }
});

/*
  POST /productos

  Todos los productos deben incluir tiendaId.
*/
router.post("/", async (req, res) => {
  try {
    const {
      codigo,
      nombre,
      precio,
      categoria,
      stockMinimo,
      tiendaId
    } = req.body;

    if (!tiendaId) {
      return res.status(400).json({
        message:
          "Debes asignar una tienda al producto"
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        tiendaId
      )
    ) {
      return res.status(400).json({
        message:
          "El identificador de la tienda no es válido"
      });
    }

    const tiendaExiste =
      await Tiendas.exists({
        _id: tiendaId
      });

    if (!tiendaExiste) {
      return res.status(404).json({
        message:
          "La tienda seleccionada no existe"
      });
    }

    const productoDuplicado =
      await Productos.findOne({
        codigo: Number(codigo),
        tiendaId
      });

    if (productoDuplicado) {
      return res.status(409).json({
        message:
          "Ya existe un producto con ese código en la tienda seleccionada"
      });
    }

    const producto =
      await Productos.create({
        codigo:
          Number(codigo),

        nombre:
          String(nombre).trim(),

        precio:
          Number(precio),

        categoria:
          String(categoria).trim(),

        stockMinimo:
          stockMinimo === undefined
            ? 5
            : Number(stockMinimo),

        tiendaId
      });

    const productoCompleto =
      await Productos
        .findById(producto._id)
        .populate(
          "tiendaId",
          "nombre direccion ciudad telefono"
        );

    res.status(201).json(
      productoCompleto
    );
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Ya existe un producto con ese código en la tienda seleccionada"
      });
    }

    res.status(500).json({
      message:
        "Error al registrar producto",

      error:
        error.message
    });
  }
});

/*
  GET /productos/:id
*/
router.get("/:id", async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "El identificador del producto no es válido"
      });
    }

    const producto =
      await Productos
        .findById(req.params.id)
        .populate(
          "tiendaId",
          "nombre direccion ciudad telefono"
        );

    if (!producto) {
      return res.status(404).json({
        message:
          "Producto no encontrado"
      });
    }

    res.json(producto);
  } catch (error) {
    res.status(500).json({
      message:
        "Error al obtener el producto",

      error:
        error.message
    });
  }
});

/*
  PUT /productos/:id
*/
router.put("/:id", async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "El identificador del producto no es válido"
      });
    }

    const productoActual =
      await Productos.findById(
        req.params.id
      );

    if (!productoActual) {
      return res.status(404).json({
        message:
          "Producto no encontrado"
      });
    }

    const tiendaId =
      req.body.tiendaId ||
      productoActual.tiendaId.toString();

    if (
      !mongoose.Types.ObjectId.isValid(
        tiendaId
      )
    ) {
      return res.status(400).json({
        message:
          "El identificador de la tienda no es válido"
      });
    }

    const tiendaExiste =
      await Tiendas.exists({
        _id: tiendaId
      });

    if (!tiendaExiste) {
      return res.status(404).json({
        message:
          "La tienda seleccionada no existe"
      });
    }

    const codigo =
      req.body.codigo !== undefined
        ? Number(req.body.codigo)
        : productoActual.codigo;

    const productoDuplicado =
      await Productos.findOne({
        _id: {
          $ne: req.params.id
        },
        codigo,
        tiendaId
      });

    if (productoDuplicado) {
      return res.status(409).json({
        message:
          "Ya existe otro producto con ese código en la tienda seleccionada"
      });
    }

    const datosActualizados = {
      ...req.body,
      codigo,
      tiendaId
    };

    const producto =
      await Productos
        .findByIdAndUpdate(
          req.params.id,
          datosActualizados,
          {
            new: true,
            runValidators: true
          }
        )
        .populate(
          "tiendaId",
          "nombre direccion ciudad telefono"
        );

    res.json(producto);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Ya existe otro producto con ese código en la tienda seleccionada"
      });
    }

    res.status(500).json({
      message:
        "Error al actualizar producto",

      error:
        error.message
    });
  }
});

/*
  DELETE /productos/:id
*/
router.delete("/:id", async (req, res) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(
        req.params.id
      )
    ) {
      return res.status(400).json({
        message:
          "El identificador del producto no es válido"
      });
    }

    const producto =
      await Productos.findByIdAndDelete(
        req.params.id
      );

    if (!producto) {
      return res.status(404).json({
        message:
          "Producto no encontrado"
      });
    }

    res.json({
      message:
        "Producto eliminado correctamente"
    });
  } catch (error) {
    res.status(500).json({
      message:
        "Error al eliminar producto",

      error:
        error.message
    });
  }
});

export default router;