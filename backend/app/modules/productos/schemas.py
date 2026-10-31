from typing import Optional, List
from sqlmodel import SQLModel, Field
from app.modules.categorias.schemas import CategoriaRead


class ProductoBase(SQLModel):
    """Atributos comunes compartidos por los esquemas de Producto."""
    nombre: str = Field(min_length=2, max_length=150)
    descripcion: Optional[str] = Field(default=None)
    precio_base: float = Field(default=0.0, ge=0)
    imagen_url: Optional[str] = Field(default=None)
    stock: int = Field(default=0, ge=0)
    disponible: bool = Field(default=True)
    categoria_id: int


class ProductoCreate(ProductoBase):
    """DTO para la creación de un producto."""
    pass


class ProductoUpdate(SQLModel):
    """DTO para la actualización parcial de un producto con PUT."""
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=150)
    descripcion: Optional[str] = Field(default=None)
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagen_url: Optional[str] = Field(default=None)
    stock: Optional[int] = Field(default=None, ge=0)
    disponible: Optional[bool] = Field(default=None)
    categoria_id: Optional[int] = Field(default=None)


class ProductoStockUpdate(SQLModel):
    """DTO específico para actualizar stock y disponibilidad mediante PATCH."""
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(ProductoBase):
    """DTO de salida para exponer un producto con su categoría asociada."""
    id: int
    activo: bool
    categoria: Optional[CategoriaRead] = None


class ProductosPaginados(SQLModel):
    """DTO de respuesta para listados paginados de productos."""
    total: int
    items: List[ProductoRead]

