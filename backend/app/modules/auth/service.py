from fastapi import HTTPException, status
from app.core.security import get_password_hash, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    """
    Servicio encargado de la lógica de autenticación y registro de usuarios.
    """

    def __init__(self, uow: UsuarioUnitOfWork | None = None) -> None:
        self.uow = uow or UsuarioUnitOfWork()

    def register(self, user_in: UserCreate) -> UserPublic:
        """
        Registra un nuevo usuario con rol 'user'.
        Regla de negocio:
        - Si el username o el email ya existen, responde 409 Conflict.
        - Las contraseñas se almacenan con hash bcrypt.
        """
        with self.uow as uow:
            # 1. Validar unicidad del nombre de usuario
            if uow.usuarios.get_by_username(user_in.username):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"El nombre de usuario '{user_in.username}' ya está en uso"
                )

            # 2. Validar unicidad del correo electrónico
            if uow.usuarios.get_by_email(user_in.email):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"El correo electrónico '{user_in.email}' ya está registrado"
                )

            # 3. Crear el nuevo usuario con contraseña hasheada y rol 'user'
            nuevo_usuario = Usuario(
                username=user_in.username,
                full_name=user_in.full_name,
                email=user_in.email,
                hashed_password=get_password_hash(user_in.password),
                role="user",
                disabled=False
            )

            uow.usuarios.add(nuevo_usuario)
            return UserPublic.model_validate(nuevo_usuario)

    def authenticate(self, username: str, password: str) -> Usuario:
        """
        Valida las credenciales de un usuario.
        Reglas de negocio:
        - Si el usuario no existe o la contraseña no coincide, responde 401 Unauthorized.
        - Si el usuario tiene disabled = True, responde 400 Bad Request con detail 'Cuenta de usuario desactivada'.
        """
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            if not usuario or not verify_password(password, usuario.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas"
                )

            if usuario.disabled:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cuenta de usuario desactivada"
                )

            return usuario

