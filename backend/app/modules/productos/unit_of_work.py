from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository
from app.modules.categorias.repository import CategoriaRepository


class ProductoUnitOfWork(UnitOfWork):
    """
    Unit of Work para el módulo de productos.
    Expone los repositorios de productos y categorías sobre la misma sesión.
    """

    def __enter__(self) -> "ProductoUnitOfWork":
        super().__enter__()
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        return self

