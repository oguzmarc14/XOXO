import { Injectable } from '@angular/core';

import {
  EstadoVenta,
  ProductoVenta,
  Venta
} from '../models/venta.model';

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private readonly claveVentas = 'ventasXoxo';

  obtenerVentas(): Venta[] {
    const ventasGuardadas = localStorage.getItem(
      this.claveVentas
    );

    if (ventasGuardadas) {
      try {
        return JSON.parse(ventasGuardadas) as Venta[];
      } catch {
        localStorage.removeItem(this.claveVentas);
      }
    }

    const ventasIniciales = this.crearVentasIniciales();

    this.guardarVentas(ventasIniciales);

    return ventasIniciales;
  }

  obtenerVentaPorId(id: number): Venta | undefined {
    return this.obtenerVentas().find(
      (venta) => venta.id === id
    );
  }

  obtenerVentaPorFolio(folio: string): Venta | undefined {
    return this.obtenerVentas().find(
      (venta) =>
        venta.folio.toLowerCase() === folio.toLowerCase()
    );
  }

  registrarVenta(
    productos: ProductoVenta[],
    metodoPago: 'efectivo' | 'tarjeta'
  ): Venta {
    if (productos.length === 0) {
      throw new Error(
        'Debes agregar al menos un producto a la venta.'
      );
    }

    const ventas = this.obtenerVentas();

    const subtotal = productos.reduce(
      (acumulado, producto) =>
        acumulado + producto.subtotal,
      0
    );

    const cantidadProductos = productos.reduce(
      (acumulado, producto) =>
        acumulado + producto.cantidad,
      0
    );

    const fechaActual = new Date();

    const siguienteId =
      ventas.length > 0
        ? Math.max(...ventas.map((venta) => venta.id)) + 1
        : 1;

    const nuevaVenta: Venta = {
      id: siguienteId,
      folio: this.generarFolio(siguienteId),
      fecha: fechaActual.toISOString().split('T')[0],
      hora: fechaActual.toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }),
      cajero:
        localStorage.getItem('nombre') ||
        'Usuario no identificado',
      correoCajero:
        localStorage.getItem('correo') ||
        'correo@xoxo.com',
      sucursal:
        localStorage.getItem('sucursal') ||
        'Sucursal no asignada',
      productos,
      cantidadProductos,
      subtotal,
      total: subtotal,
      metodoPago,
      estado: 'completada'
    };

    ventas.unshift(nuevaVenta);

    this.guardarVentas(ventas);

    return nuevaVenta;
  }

  cancelarVenta(
    id: number,
    motivo: string
  ): Venta {
    const ventas = this.obtenerVentas();

    const indice = ventas.findIndex(
      (venta) => venta.id === id
    );

    if (indice === -1) {
      throw new Error('No se encontró la venta.');
    }

    if (ventas[indice].estado === 'cancelada') {
      throw new Error('La venta ya está cancelada.');
    }

    if (ventas[indice].estado === 'devuelta') {
      throw new Error(
        'No se puede cancelar una venta devuelta.'
      );
    }

    if (!motivo.trim()) {
      throw new Error(
        'Debes indicar el motivo de la cancelación.'
      );
    }

    const ventaActualizada: Venta = {
      ...ventas[indice],
      estado: 'cancelada',
      motivoCancelacion: motivo.trim(),
      fechaCancelacion: new Date().toISOString(),
      canceladaPor:
        localStorage.getItem('nombre') ||
        'Usuario no identificado'
    };

    ventas[indice] = ventaActualizada;

    this.guardarVentas(ventas);

    return ventaActualizada;
  }

  devolverVenta(id: number): Venta {
    const ventas = this.obtenerVentas();

    const indice = ventas.findIndex(
      (venta) => venta.id === id
    );

    if (indice === -1) {
      throw new Error('No se encontró la venta.');
    }

    if (ventas[indice].estado !== 'completada') {
      throw new Error(
        'Solo se pueden devolver ventas completadas.'
      );
    }

    const ventaActualizada: Venta = {
      ...ventas[indice],
      estado: 'devuelta'
    };

    ventas[indice] = ventaActualizada;

    this.guardarVentas(ventas);

    return ventaActualizada;
  }

  contarPorEstado(estado: EstadoVenta): number {
    return this.obtenerVentas().filter(
      (venta) => venta.estado === estado
    ).length;
  }

  calcularTotalCompletado(): number {
    return this.obtenerVentas()
      .filter((venta) => venta.estado === 'completada')
      .reduce(
        (acumulado, venta) => acumulado + venta.total,
        0
      );
  }

  private guardarVentas(ventas: Venta[]): void {
    localStorage.setItem(
      this.claveVentas,
      JSON.stringify(ventas)
    );
  }

  private generarFolio(id: number): string {
    return `V-${id.toString().padStart(4, '0')}`;
  }

  private crearVentasIniciales(): Venta[] {
    return [
      this.crearVentaSimulada(
        18,
        'V-0018',
        '2026-06-19',
        '14:35',
        'María López',
        'Sucursal #027 - Centro',
        345,
        5,
        'completada'
      ),
      this.crearVentaSimulada(
        17,
        'V-0017',
        '2026-06-19',
        '14:12',
        'María López',
        'Sucursal #027 - Centro',
        128,
        2,
        'completada'
      ),
      this.crearVentaSimulada(
        16,
        'V-0016',
        '2026-06-19',
        '13:58',
        'María López',
        'Sucursal #027 - Centro',
        79,
        1,
        'devuelta'
      ),
      this.crearVentaSimulada(
        15,
        'V-0015',
        '2026-06-19',
        '13:41',
        'José Ramírez',
        'Sucursal #027 - Centro',
        286,
        4,
        'completada'
      ),
      this.crearVentaSimulada(
        14,
        'V-0014',
        '2026-06-18',
        '18:22',
        'José Ramírez',
        'Sucursal #027 - Centro',
        450,
        6,
        'cancelada'
      )
    ];
  }

  private crearVentaSimulada(
    id: number,
    folio: string,
    fecha: string,
    hora: string,
    cajero: string,
    sucursal: string,
    total: number,
    cantidadProductos: number,
    estado: EstadoVenta
  ): Venta {
    const productos: ProductoVenta[] = [
      {
        id: id * 10,
        nombre: 'Producto de prueba',
        precio: total / cantidadProductos,
        cantidad: cantidadProductos,
        subtotal: total
      }
    ];

    return {
      id,
      folio,
      fecha,
      hora,
      cajero,
      correoCajero: 'cajero@xoxo.com',
      sucursal,
      productos,
      cantidadProductos,
      subtotal: total,
      total,
      metodoPago: 'efectivo',
      estado
    };
  }
}