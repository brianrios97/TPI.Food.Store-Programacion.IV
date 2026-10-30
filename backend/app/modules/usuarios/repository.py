from typing import Optional
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    """
    Repositorio especializado para la entidad Usuario.
    Hereda las operaciones CRUD de BaseRepository y añade consultas por username y email.
    """

    def __init__(self, session: Session) -> None:
        super().__init__(session, Usuario)

    def get_by_username(self, username: str) -> Optional[Usuario]:
        """
        Busca un usuario por su nombre de usuario único.
        Utilizado para autenticación en el login y validación de duplicados.
        """
        statement = select(Usuario).where(Usuario.username == username)
        return self.session.exec(statement).first()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        """
        Busca un usuario por su correo electrónico único.
        Utilizado para validación de registros duplicados.
        """
        statement = select(Usuario).where(Usuario.email == email)
        return self.session.exec(statement).first()

