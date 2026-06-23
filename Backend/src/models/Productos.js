import mongoose from "mongoose";

const productosSchema = new mongoose.Schema(
  {
    codigo: {
      type: Number,
      required: [
        true,
        "El código del producto es obligatorio"
      ],
      min: [
        1,
        "El código debe ser mayor a cero"
      ]
    },

    nombre: {
      type: String,
      required: [
        true,
        "El nombre del producto es obligatorio"
      ],
      trim: true
    },

    precio: {
      type: Number,
      required: [
        true,
        "El precio del producto es obligatorio"
      ],
      min: [
        0.01,
        "El precio debe ser mayor a cero"
      ]
    },

    categoria: {
      type: String,
      required: [
        true,
        "La categoría es obligatoria"
      ],
      trim: true
    },

    stockMinimo: {
      type: Number,
      required: true,
      default: 5,
      min: [
        0,
        "El stock mínimo no puede ser negativo"
      ]
    },

    tiendaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tiendas",
      required: [
        true,
        "La tienda del producto es obligatoria"
      ]
    }
  },
  {
    timestamps: true
  }
);

/*
  El código debe ser único dentro de cada tienda.

  Esto permite que dos tiendas utilicen el mismo
  código, pero impide duplicarlo en una misma tienda.
*/
productosSchema.index(
  {
    codigo: 1,
    tiendaId: 1
  },
  {
    unique: true
  }
);

export default mongoose.model(
  "Productos",
  productosSchema
);