from datetime import datetime
from typing import Optional, List, Literal
from sqlmodel import SQLModel, Field


class ItemPedidoCreate(SQLModel):
    """Representa un producto y su cantidad al crear un pedido desde el carrito."""
    producto_id: int
    cantidad: int = Field(default=1, ge=1)


class PedidoCreate(SQLModel):
    """
    DTO recibido para la confirmación de un pedido (Checkout).
    Cumple con las reglas RN-01 y RN-06.
    """
    items: List[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: Literal["EFECTIVO", "TRANSFERENCIA"]
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: Optional[str] = Field(default=None)


class DetallePedidoRead(SQLModel):
    """DTO de salida de cada línea de un pedido (foto histórica inmutable)."""
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    """DTO completo de salida de un pedido, con sus líneas y totales."""
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: Optional[str] = None
    total: float
    created_at: datetime
    updated_at: datetime
    items: List[DetallePedidoRead] = []


class PedidosPaginados(SQLModel):
    """DTO para listados paginados de pedidos."""
    total: int
    items: List[PedidoRead]


class CambioEstado(SQLModel):
    """DTO para la actualización de estado por parte del administrador."""
    estado: Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]


class ResumenPedidos(SQLModel):
    """DTO para el panel de métricas e indicadores de negocio del administrador."""
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float

