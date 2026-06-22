import express from "express"
import Productos from "../models/Productos.js"

const router = express.Router();

router.get("/", async (req, res) => {
    try{
        const filtro = {};
        if (req.query.tiendaId) {
            filtro.tiendaId = req.query.tiendaId;
        }

        const productos = await Productos.find(filtro);

        res.json(productos);
    }
    catch (error) {
        res.status(500).json({
            message: "Error al obtener productos",
            error: error.message
        })
    }
});

router.post("/", async (req, res) => {
    try{
        const productos = await Productos.create(req.body);

        res.status(201).json(productos);
    }
    catch (error){
        res.status(500).json({
            message: "Error al registrar producto",
            error: error.message
        });
    }
})

router.get("/:id", async (req, res) => {
    try{
        const productos = await Productos.findById(req.params.id);

        if(!productos){
            return res.status(404).json({
                message: "Producto no encontrado"
            });
        }
        res.json(productos)
    }

    catch(error){
        res.status(500).json({
            message: "Error al obtener el producto",
            error: error.message
        });
    }
});

router.put("/:id", async (req, res) => {
    try{
        const productos = await Productos.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if(!productos) {
            return res.status(404).json({
                message: "Producto no encontrado"
            })
        }

        res.json(productos);
    }

    catch(error){
        res.status(500).json({
            message: "Error al actualizar producto",
            error: error.message
        });
    }
});

router.delete("/:id", async (req, res) =>{
    try{
        const productos = await Productos.findByIdAndDelete(req.params.id);

        if(!productos){
            return res.status(404).json({
                message: "Producto no encontrado"
            })
        }

        res.json({
            message: "Producto eliminada correctamente"
        });
    }

    catch (error){
        res.status(500).json({
            message: "Error al eliminar producto",
            error: error.message
        });
    }
});

export default router;



