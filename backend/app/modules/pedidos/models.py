from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.usuarios.models import Usuario
    from app.modules.productos.models import Producto


class Pedido(SQLModel, table=True):
    """
    Modelo de tabla para la entidad Pedido.
    Representa una orden de compra realizada por un cliente.
    """
    __tablename__ = "pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(
        foreign_key="usuario.id",
        nullable=False,
        index=True
    )
    estado: str = Field(
        default="PENDIENTE",
        nullable=False,
        index=True
    )  # PENDIENTE, EN_PREPARACION, ENTREGADO, CANCELADO
    forma_pago: str = Field(nullable=False)  # EFECTIVO o TRANSFERENCIA
    direccion_entrega: str = Field(
        min_length=5,
        max_length=200,
        nullable=False
    )
    notas: Optional[str] = Field(default=None, nullable=True)
    total: float = Field(default=0.0, ge=0, nullable=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relación N:1 con Usuario (Usuario 1:N Pedido)
    usuario: Optional["Usuario"] = Relationship(back_populates="pedidos")

    # Relación 1:N de Composición con DetallePedido (Pedido 1:N DetallePedido)
    items: List["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    """
    Modelo de tabla para la entidad DetallePedido.
    Representa cada ítem individual dentro de un pedido.
    Guarda una copia inmutable del nombre y precio del producto al momento de comprar (RN-05).
    """
    __tablename__ = "detallepedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(
        foreign_key="pedido.id",
        nullable=False,
        index=True
    )
    producto_id: int = Field(
        foreign_key="producto.id",
        nullable=False,
        index=True
    )
    cantidad: int = Field(default=1, ge=1, nullable=False)
    nombre_producto: str = Field(nullable=False)
    precio_unitario: float = Field(ge=0, nullable=False)
    subtotal: float = Field(ge=0, nullable=False)

    # Relación N:1 con Pedido
    pedido: Optional[Pedido] = Relationship(back_populates="items")

    # Relación N:1 con Producto (Producto 1:N DetallePedido)
    producto: Optional["Producto"] = Relationship(back_populates="detalles")

