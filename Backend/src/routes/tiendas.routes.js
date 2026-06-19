import express from "express";
import Tiendas from "../models/Tiendas.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const tiendas = await Tiendas.find();

        res.json(tiendas);
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener tiendas",
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const tiendas = await Tiendas.create(req.body);

        res.status(201).json(tiendas);
    } catch (error) {
        res.status(500).json({
            message: "Error al crear tienda",
            error: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try{
        const tiendas = await Tiendas.findById(req.params.id);

        if (!tiendas){
            return res.status(404).json({ message: "Tienda no encontrada" });
        }

         res.json(tiendas);
    }
    catch (error) {
        res.status(500).json({
            message: "Error al obtener tienda",
            error: error.message
        });
    }
});

router.put("/:id", async (req, res) =>{
    try{
        const tiendas = await Tiendas.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if(!tiendas) {
            return res.status(404).json({ message: "Tienda no encontrada"});
        }

        res.json(tiendas);
    }
    catch (error) {
        res.status(500).json({
            message: "Error al actualizar tienda",
            error: error.message
        });
    }
});

router.delete("/:id", async (req, res) =>{
    try{
        const tiendas = await Tiendas.findByIdAndDelete(req.params.id);

        if(!tiendas){
            return res.status(404).json({ message: "Tienda no encontrada" });
        }

        res.json({ message: "Tienda eliminada correctamente" });
    }
    catch (error) {
        res.status(500).json({
            message: "Error al eliminar tienda",
            error: error.message
        });
    }
});


export default router;