from typing import Optional
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoStockUpdate,
    ProductoRead,
    ProductosPaginados
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork
from app.modules.categorias.service import CategoriaNoEncontrada


class ProductoNoEncontrado(Exception):
    """Excepción lanzada cuando un producto no existe o está dado de baja."""
    pass


class ProductoService:
    """
    Servicio de dominio para la gestión del catálogo de productos.
    Implementa reglas de negocio, validación de categorías y cálculo de stock.
    """

    def __init__(self, uow: ProductoUnitOfWork | None = None) -> None:
        self.uow = uow or ProductoUnitOfWork()

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None
    ) -> ProductosPaginados:
        """Retorna el catálogo paginado de productos activos según filtros."""
        with self.uow as uow:
            total, items = uow.productos.search(
                skip=skip,
                limit=limit,
                search=search,
                categoria_id=categoria_id,
                disponible=disponible
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(p) for p in items]
            )

    def get_by_id(self, producto_id: int) -> ProductoRead:
        """
        Retorna el detalle de un producto activo con su categoría.
        Responde ProductoNoEncontrado si está inactivo o no existe.
        """
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado(f"Producto con ID {producto_id} no encontrado")
            return ProductoRead.model_validate(producto)

    def create(self, data: ProductoCreate) -> ProductoRead:
        """
        Crea un nuevo producto en el catálogo.
        Regla: la categoría asociada debe existir y estar activa.
        """
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(data.categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada(
                    f"Categoría con ID {data.categoria_id} no existe o está dada de baja"
                )

            nuevo_producto = Producto(
                nombre=data.nombre,
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagen_url=data.imagen_url,
                stock=data.stock,
                disponible=data.disponible,
                activo=True,
                categoria_id=data.categoria_id
            )
            uow.productos.add(nuevo_producto)
            return ProductoRead.model_validate(nuevo_producto)

    def update(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        """
        Actualiza parcialmente los campos enviados de un producto.
        Si se envía una nueva categoría, valida que exista y esté activa.
        """
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado(f"Producto con ID {producto_id} no encontrado")

            if data.categoria_id is not None:
                nueva_cat = uow.categorias.get_by_id(data.categoria_id)
                if not nueva_cat or not nueva_cat.activo:
                    raise CategoriaNoEncontrada(
                        f"Categoría con ID {data.categoria_id} no existe o está dada de baja"
                    )
                producto.categoria_id = data.categoria_id

            if data.nombre is not None:
                producto.nombre = data.nombre
            if data.descripcion is not None:
                producto.descripcion = data.descripcion
            if data.precio_base is not None:
                producto.precio_base = data.precio_base
            if data.imagen_url is not None:
                producto.imagen_url = data.imagen_url
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible

            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def update_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        """Actualiza rápidamente el stock y la disponibilidad operativa (PATCH)."""
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado(f"Producto con ID {producto_id} no encontrado")

            producto.stock = data.stock
            producto.disponible = data.disponible
            uow.productos.add(producto)
            return ProductoRead.model_validate(producto)

    def delete(self, producto_id: int) -> None:
        """Baja lógica de un producto (activo = False)."""
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)
            if not producto or not producto.activo:
                raise ProductoNoEncontrado(f"Producto con ID {producto_id} no encontrado")

            producto.activo = False
            uow.productos.add(producto)

