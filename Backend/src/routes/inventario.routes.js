import express from "express"
import { Inventario } from "../models/Inventario.js"

const router = express.Router();

router.get("/", async (req, res) =>{
    try{
        const inventario = await Inventario.find();

        res.json(inventario);
    }

    catch(error){
        res.status(500).json({
            message: "Error al obtener productos",
            error: error.message
        })
    }
});

router.post("/", async (req, res) =>{
    try{

        const inventario = await Inventario.create(req.body);

        res.status(201).json(inventario)
    }
    catch(error){
        res.status(500).json({
            message: "Error al crear inventario",
            error: error.message
        });
    }
});

export default router;


