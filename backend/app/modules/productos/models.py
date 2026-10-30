from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    """
    Modelo de tabla para la entidad Producto.
    Representa las comidas y bebidas que se ofrecen en el catálogo.
    """
    __tablename__ = "producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(
        foreign_key="categoria.id",
        nullable=False,
        index=True
    )
    nombre: str = Field(nullable=False, index=True)
    descripcion: Optional[str] = Field(default=None, nullable=True)
    precio_base: float = Field(default=0.0, ge=0, nullable=False)
    imagen_url: Optional[str] = Field(default=None, nullable=True)
    stock: int = Field(default=0, ge=0, nullable=False)
    disponible: bool = Field(default=True, nullable=False)
    activo: bool = Field(default=True, nullable=False)  # Baja lógica

    # Relación N:1 con Categoría (Categoria 1:N Producto)
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")

    # Relación 1:N con DetallePedido (Producto 1:N DetallePedido)
    detalles: List["DetallePedido"] = Relationship(back_populates="producto")

