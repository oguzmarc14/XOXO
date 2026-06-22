import express from "express";
import Productos from "../models/Productos.js";
import Tiendas from "../models/Tiendas.js";
import Ventas from "../models/Ventas.js";
import Inventario from "../models/Inventario.js";
import Alertas from "../models/Alertas.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { tiendaId, productos } = req.body;

    if (!tiendaId || !productos || !Array.isArray(productos)) {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    const tienda = await Tiendas.findById(tiendaId);

    if (!tienda) {
      return res.status(404).json({ message: "La tienda no existe" });
    }

    const productosProcesados = [];
    let total = 0;

    for (let i = 0; i < productos.length; i++) {
      const productoActual = productos[i];

      const producto = await Productos.findById(productoActual.productoId);

      if (!producto) {
        return res.status(404).json({ message: "El producto no existe" });
      }

      const cantidad = productoActual.cantidad;
      const precio = producto.precio;
      const subtotal = cantidad * precio;

      const inventario = await Inventario.findOne({
        tiendaId,
        productoId: productoActual.productoId,
      });

      if (!inventario) {
        return res.status(404).json({ message: "Inventario no encontrado" });
      }

      const stockAnterior = inventario.piezas;
      const stockNuevo = stockAnterior - cantidad;

      inventario.piezas = stockNuevo;

      await inventario.save();

      if (stockNuevo < 0) {
        await Alertas.create({
          tiendaId,
          productoId: producto._id,
          tipo: "STOCK_NEGATIVO",
          mensaje: `El producto ${producto.nombre} quedó con inventario negativo`,
          stockAnterior,
          cantidadVendida: cantidad,
          stockNuevo,
        });
      }

      if (stockNuevo >= 0 && stockNuevo <= producto.stockMinimo) {
        await Alertas.create({
          tiendaId,
          productoId: producto._id,
          tipo: "STOCK_BAJO",
          mensaje: `El producto ${producto.nombre} quedó con stock bajo. Stock actual: ${stockNuevo}, mínimo recomendado: ${producto.stockMinimo}`,
          stockAnterior,
          cantidadVendida: cantidad,
          stockNuevo,
        });
      }

      total = total + subtotal;

      productosProcesados.push({
        productoId: producto._id,
        cantidad,
        precioUnitario: precio,
        subtotal,
        stockAnterior,
        stockNuevo,
      });
    }

    const venta = await Ventas.create({
      tiendaId,
      productos: productosProcesados,
      total,
    });

    return res.status(201).json({
      message: "Venta registrada correctamente",
      venta,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al registrar venta",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const ventas = await Ventas.find()
      .populate("tiendaId")
      .populate("productos.productoId")
      .sort({ fecha: -1 });

    return res.status(200).json(ventas);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener ventas",
      error: error.message,
    });
  }
});

export default router;

//recibo los datos de la venta
//verificar que todos los datos de la venta existan
//despues tenemos que verificar que nuestro producto viene completo
//despues tenemos que verificar que existe una tienda
//tenemos que verificar que nuestro producto existe
//ya despues pudiera ser que tuvieramos piezas para mandar un error o alerta
//ya despues pues tuvieramos que obtener precio y cantidad para sacar el subtotal
//realziar la suma para el producto
//pero claramente tambien ya casi al final tenemos que guardar el informe de la venta con todo y la logica para descontar piezas etc
