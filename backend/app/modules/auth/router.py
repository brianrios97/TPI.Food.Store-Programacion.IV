from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.config import settings
from app.core.security import create_access_token
from app.core.deps import get_current_active_user
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticación"])


def get_auth_service() -> AuthService:
    """Inyección de dependencias para el servicio de autenticación."""
    return AuthService()


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar un nuevo usuario"
)
def register(
    user_in: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
) -> UserPublic:
    """
    Registro público de usuarios. Asigna por defecto el rol 'user'.
    Responde 409 si el nombre de usuario o correo ya existen.
    """
    return auth_service.register(user_in)


@router.post(
    "/token",
    status_code=status.HTTP_200_OK,
    summary="Iniciar sesión (Login con OAuth2 y cookie HttpOnly)"
)
def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service)
) -> dict:
    """
    Autentica al usuario mediante formulario OAuth2.
    Entrega el JWT en la cookie HttpOnly 'access_token' (expira en 30 minutos).
    El cuerpo de la respuesta NO contiene el token, solo un mensaje de éxito.
    """
    usuario = auth_service.authenticate(
        username=form_data.username,
        password=form_data.password
    )

    # Crear el JWT con la información del usuario
    token_data = {
        "sub": usuario.username,
        "user_id": usuario.id,
        "role": usuario.role
    }
    access_token = create_access_token(data=token_data)

    # Establecer la cookie HttpOnly
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False  # Para desarrollo local sobre HTTP
    )

    return {"message": "Login exitoso"}


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Cerrar sesión"
)
def logout(response: Response) -> dict:
    """
    Elimina la cookie HttpOnly 'access_token' del navegador del cliente.
    """
    response.delete_cookie(
        key="access_token",
        samesite="lax"
    )
    return {"message": "Sesión cerrada exitosamente"}


@router.get(
    "/me",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
    summary="Obtener perfil del usuario autenticado"
)
def get_me(
    current_user: Usuario = Depends(get_current_active_user)
) -> UserPublic:
    """
    Retorna los datos del usuario en sesión activa.
    Responde 401 si no hay sesión o si expiró, y 400 si la cuenta está desactivada.
    """
    return UserPublic.model_validate(current_user)

