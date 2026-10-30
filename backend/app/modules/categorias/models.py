from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    """
    Modelo de tabla para la entidad Categoria.
    Agrupa los productos del catálogo (ej. Hamburguesas, Pizzas, Bebidas).
    """
    __tablename__ = "categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(
        unique=True,
        index=True,
        nullable=False,
        min_length=2,
        max_length=100
    )
    descripcion: Optional[str] = Field(default=None, nullable=True)
    activo: bool = Field(default=True, nullable=False)  # Baja lógica

    # Relación 1:N con Productos (Categoria 1:N Producto)
    productos: List["Producto"] = Relationship(back_populates="categoria")

