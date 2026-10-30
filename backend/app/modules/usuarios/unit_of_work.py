from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    """
    Unit of Work para el módulo de usuarios.
    Expone el repositorio de usuarios compartiendo la misma sesión transaccional.
    """

    def __enter__(self) -> "UsuarioUnitOfWork":
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        return self

