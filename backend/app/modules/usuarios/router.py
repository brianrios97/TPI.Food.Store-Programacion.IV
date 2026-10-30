from typing import List
from fastapi import APIRouter, Depends, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/admin/usuarios", tags=["Admin - Usuarios"])


def get_usuario_service() -> UsuarioService:
    """Inyección de dependencias para el servicio de usuarios."""
    return UsuarioService()


@router.get(
    "",
    response_model=List[UserPublic],
    status_code=status.HTTP_200_OK,
    summary="Listar todos los usuarios (Admin)"
)
def list_usuarios(
    _: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service)
) -> List[UserPublic]:
    """
    Retorna la lista completa de usuarios registrados.
    Solo accesible para administradores.
    """
    return service.list_usuarios()


@router.post(
    "/{id}/activar",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
    summary="Activar un usuario (Admin)"
)
def activar_usuario(
    id: int,
    _: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service)
) -> UserPublic:
    """
    Activa un usuario marcando disabled = False.
    Operación idempotente. Responde 404 si el usuario no existe.
    """
    return service.activar_usuario(user_id=id)


@router.post(
    "/{id}/desactivar",
    response_model=UserPublic,
    status_code=status.HTTP_200_OK,
    summary="Desactivar un usuario (Admin)"
)
def desactivar_usuario(
    id: int,
    admin_user: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service)
) -> UserPublic:
    """
    Desactiva un usuario marcando disabled = True.
    Responde 400 si el administrador intenta desactivarse a sí mismo.
    Responde 404 si el usuario no existe.
    """
    return service.desactivar_usuario(
        user_id=id,
        current_admin_id=admin_user.id
    )

