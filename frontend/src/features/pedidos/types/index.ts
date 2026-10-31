export type EstadoPedido = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";
export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

export interface ItemPedidoCreate {
  producto_id: number;
  cantidad: number;
}

export interface PedidoCreate {
  items: ItemPedidoCreate[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas?: string | null;
}

export interface DetallePedidoRead {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

export interface PedidoRead {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas?: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedidoRead[];
}

export interface PedidosPaginados {
  total: number;
  items: PedidoRead[];
}

export interface ResumenPedidos {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
}
