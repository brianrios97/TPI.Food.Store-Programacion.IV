from typing import List
from fastapi import HTTPException, status
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork
from app.modules.usuarios.schemas import UserPublic


class UsuarioService:
    """
    Servicio con la lógica de negocio para la gestión de usuarios.
    Utiliza el Unit of Work para garantizar transacciones atómicas.
    """

    def __init__(self, uow: UsuarioUnitOfWork | None = None) -> None:
        self.uow = uow or UsuarioUnitOfWork()

    def list_usuarios(self) -> List[UserPublic]:
        """
        Retorna el listado completo de usuarios en formato público.
        Exclusivo para el panel de administración.
        """
        with self.uow as uow:
            usuarios = uow.usuarios.get_all(skip=0, limit=1000)
            return [UserPublic.model_validate(u) for u in usuarios]

    def activar_usuario(self, user_id: int) -> UserPublic:
        """
        Activa un usuario (disabled = False).
        Operación idempotente: si ya estaba activo responde 200 igualmente.
        Responde 404 si el usuario no existe.
        """
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(user_id)
            if not usuario:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado"
                )

            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar_usuario(self, user_id: int, current_admin_id: int) -> UserPublic:
        """
        Desactiva un usuario (disabled = True).
        Regla de negocio: El administrador no puede desactivarse a sí mismo (responde 400).
        Operación idempotente: si ya estaba desactivado responde 200 igualmente.
        Responde 404 si el usuario no existe.
        """
        if user_id == current_admin_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El administrador no puede desactivarse a sí mismo"
            )

        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(user_id)
            if not usuario:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Usuario no encontrado"
                )

            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

