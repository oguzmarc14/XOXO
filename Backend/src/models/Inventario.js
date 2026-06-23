import mongoose from "mongoose";

const inventarioSchema =
  new mongoose.Schema(
    {
      tiendaId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Tiendas",
        required: true,
        index: true,
      },

      productoId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Productos",
        required: true,
      },

      piezas: {
        type: Number,
        default: 0,
        min: 0,
      },

      fechaGeneracion: {
        type: Date,
        default: Date.now,
      },
    },
    {
      timestamps: true,
    }
  );

/*
  Un producto solo puede tener un registro
  dentro del inventario vigente de una tienda.
*/
inventarioSchema.index(
  {
    tiendaId: 1,
    productoId: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model(
  "Inventario",
  inventarioSchema
);