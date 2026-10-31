from app.core.unit_of_work import UnitOfWork
from app.modules.pedidos.repository import PedidoRepository
from app.modules.productos.repository import ProductoRepository


class PedidoUnitOfWork(UnitOfWork):
    """
    Unit of Work para el módulo de pedidos.
    Expone los repositorios de pedidos y de productos compartiendo la misma sesión
    para garantizar transacciones atómicas al verificar y descontar stock.
    """

    def __enter__(self) -> "PedidoUnitOfWork":
        super().__enter__()
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)
        return self

