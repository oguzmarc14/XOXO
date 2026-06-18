import Productos from "../models/Productos";
import Tiendas from "../models/Tiendas";
import express from "express";
import Venta from "../models/Venta"

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { tiendaId, productos } = req.body;

    if (!tiendaId || !productos) {
      return res.status(400).json({
        message: "Datos incompletos",
      });
    }

    const tienda = await Tiendas.findById(tiendaId);

    if (!tienda) {
      return res.status(404).json({
        message: "La tienda no existe",
      });
    }

    let productosProcesados = [];
    let total = 0;

    for (let i = 0; i < productos.length; i++) {
      const productoActual = productos[i];

      const producto = await Productos.findById(
        productoActual.productoId
      );

      if (!producto) {
        return res.status(404).json({
          message: "El producto no existe",
        });
      }

      let cantidad = productoActual.cantidad;
      let precio = producto.precio;

      let subtotal = cantidad * precio;

      total = total + subtotal;

      productosProcesados.push({
        productoId: producto._id,
        cantidad,
        precioUnitario: precio,
        subtotal
      });
    }

    const venta = await  Venta.create({
        tiendaId,
        productos: productosProcesados,
        total
    })

    return res.status(201).json({
        message: "Venta registrada correctamente",
        venta
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error al registrar venta",
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