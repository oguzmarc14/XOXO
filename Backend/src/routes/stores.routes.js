import express from "express";
import { Store } from "../models/Store.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const stores = await Store.find();

        res.json(stores);
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener tiendas",
            error: error.message
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const store = await Store.create(req.body);

        res.status(201).json(store);
    } catch (error) {
        res.status(500).json({
            message: "Error al crear tienda",
            error: error.message
        });
    }
});

router.get("/:id", async (req, res) => {
    try{
        const store = await Store.findById(req.params.id);

        if (!store){
            return res.status(404).json({ message: "Tienda no encontrada" });
        }

         res.json(store);
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
        const store = await Store.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if(!store) {
            return res.status(404).json({ message: "Tienda no encontrada"});
        }

        res.json(store);
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
        const store = await Store.findByIdAndDelete(req.params.id);

        if(!store){
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