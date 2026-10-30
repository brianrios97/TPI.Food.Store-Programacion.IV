from typing import Generic, TypeVar, Type, Optional, List
from sqlmodel import SQLModel, Session, select

# Tipo genérico T acotado a modelos de SQLModel
T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """
    Repositorio base genérico que implementa las operaciones de persistencia CRUD estándar.
    No contiene reglas de negocio ni ejecuta commit (el commit es responsabilidad exclusiva del Unit of Work).
    """

    def __init__(self, session: Session, model: Type[T]) -> None:
        self.session = session
        self.model = model

    def get_by_id(self, id: int) -> Optional[T]:
        """Obtiene un registro por su clave primaria (ID)."""
        return self.session.get(self.model, id)

    def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """Obtiene un listado paginado de registros."""
        statement = select(self.model).offset(skip).limit(limit)
        return list(self.session.exec(statement).all())

    def add(self, entity: T) -> T:
        """Agrega una entidad a la sesión actual de la base de datos."""
        self.session.add(entity)
        return entity

    def delete(self, entity: T) -> None:
        """Marca una entidad para ser eliminada de la base de datos."""
        self.session.delete(entity)

