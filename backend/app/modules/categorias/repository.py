from typing import Optional, List
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    """
    Repositorio para la entidad Categoria.
    Hereda las operaciones CRUD y provee consultas especializadas por nombre y estado activo.
    """

    def __init__(self, session: Session) -> None:
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        """Busca una categoría por su nombre exacto."""
        statement = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(statement).first()

    def get_activas(self) -> List[Categoria]:
        """Retorna únicamente las categorías que no fueron dadas de baja lógica."""
        statement = select(Categoria).where(Categoria.activo == True)
        return list(self.session.exec(statement).all())

