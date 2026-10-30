from typing import Generator, List, Callable
from fastapi import Request, Depends, HTTPException, status
from sqlmodel import Session, select
from app.core.database import session_factory
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_session() -> Generator[Session, None, None]:
    """
    Generador de sesión de base de datos para inyección de dependencias con Depends().
    Garantiza que la sesión se cierre al finalizar la petición HTTP.
    """
    with session_factory() as session:
        yield session


def get_current_user(
    request: Request,
    session: Session = Depends(get_session)
) -> Usuario:
    """
    Extrae el token JWT desde la cookie HttpOnly 'access_token',
    valida su firma y expiración, y recupera el usuario correspondiente.
    Responde 401 si falta la cookie, si el token es inválido o si el usuario no existe.
    """
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado"
        )

    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

    # Identificador del usuario guardado en el claim del JWT
    user_id = payload.get("user_id")
    username = payload.get("sub")

    user: Usuario | None = None
    if user_id is not None:
        user = session.get(Usuario, user_id)
    elif username is not None:
        statement = select(Usuario).where(Usuario.username == username)
        user = session.exec(statement).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )

    return user


def get_current_active_user(
    current_user: Usuario = Depends(get_current_user)
) -> Usuario:
    """
    Verifica que el usuario autenticado no esté desactivado (baja lógica).
    Exigencia de la consigna: responde 400 con detail 'Cuenta de usuario desactivada'.
    """
    if current_user.disabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cuenta de usuario desactivada"
        )
    return current_user


def require_role(allowed_roles: List[str]) -> Callable[[Usuario], Usuario]:
    """
    Fábrica de dependencias para autorización basada en roles (RBAC).
    Verifica si el usuario activo posee uno de los roles autorizados.
    Responde 403 Forbidden si el rol no está permitido.
    """
    def role_checker(
        current_user: Usuario = Depends(get_current_active_user)
    ) -> Usuario:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para realizar esta acción"
            )
        return current_user

    return role_checker

