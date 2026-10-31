from typing import Optional
from sqlmodel import SQLModel, Field


class CategoriaBase(SQLModel):
    """Atributos comunes compartidos por los esquemas de Categoria."""
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None)


class CategoriaCreate(CategoriaBase):
    """DTO para crear una nueva categoría."""
    pass


class CategoriaUpdate(SQLModel):
    """DTO para actualizar parcialmente una categoría existente."""
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None)


class CategoriaRead(CategoriaBase):
    """DTO de salida para exponer categorías al cliente."""
    id: int
    activo: bool

