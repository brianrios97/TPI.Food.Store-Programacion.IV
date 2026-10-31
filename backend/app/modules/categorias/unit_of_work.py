from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    """
    Unit of Work para el módulo de categorías.
    Expone el repositorio de categorías sobre una sesión transaccional.
    """

    def __enter__(self) -> "CategoriaUnitOfWork":
        super().__enter__()
        self.categorias = CategoriaRepository(self.session)
        return self

