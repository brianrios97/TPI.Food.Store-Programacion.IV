from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    CambioEstado,
    ResumenPedidos
)
from app.modules.pedidos.service import (
    PedidoService,
    PedidoNoEncontrado,
    ProductoNoEncontrado,
    PedidoAjeno,
    StockInsuficiente,
    ProductoNoDisponible,
    ProductoRepetido,
    TransicionInvalida
)

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


def get_pedido_service() -> PedidoService:
    """Inyección de dependencias para el servicio de pedidos."""
    return PedidoService()


@router.post(
    "",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un pedido desde el carrito (RN-01)"
)
def create_pedido(
    data: PedidoCreate,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service)
) -> PedidoRead:
    """
    Crea transaccionalmente un pedido a partir de los ítems del carrito.
    Valida y descuenta stock en la misma transacción.
    """
    try:
        return service.crear_pedido(usuario_id=current_user.id, data=data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except (StockInsuficiente, ProductoNoDisponible, ProductoRepetido) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "",
    response_model=PedidosPaginados,
    status_code=status.HTTP_200_OK,
    summary="Listar pedidos (Propios si es cliente, todos si es admin)"
)
def list_pedidos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    estado: Optional[str] = Query(default=None),
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service)
) -> PedidosPaginados:
    """
    Retorna el listado paginado de pedidos.
    Filtra automáticamente por el usuario en sesión (a menos que sea admin).
    """
    return service.list_pedidos(
        usuario=current_user,
        skip=skip,
        limit=limit,
        estado=estado
    )


# OBLIGATORIO: Declarado antes de /{id} para evitar colisión de rutas
@router.get(
    "/resumen",
    response_model=ResumenPedidos,
    status_code=status.HTTP_200_OK,
    summary="Obtener métricas y resumen del negocio (Admin)"
)
def get_resumen_pedidos(
    _: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service)
) -> ResumenPedidos:
    """Retorna los indicadores consolidados de pedidos e ingresos para el panel de administración."""
    return service.get_resumen()


@router.get(
    "/{id}",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
    summary="Detalle de un pedido con sus líneas"
)
def get_pedido(
    id: int,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service)
) -> PedidoRead:
    """Retorna el detalle completo de un pedido. Verifica permisos por dueño o rol admin."""
    try:
        return service.get_pedido(pedido_id=id, usuario=current_user)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PedidoAjeno as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))


@router.patch(
    "/{id}/estado",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
    summary="Avanzar o cancelar pedido según máquina de estados (Admin)"
)
def update_estado(
    id: int,
    data: CambioEstado,
    _: Usuario = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service)
) -> PedidoRead:
    """
    Avanza o cancela el pedido según el mapa de transiciones.
    Si se cancela, restituye el stock automáticamente (RN-03).
    """
    try:
        return service.cambiar_estado_admin(pedido_id=id, nuevo_estado=data.estado)
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except TransicionInvalida as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch(
    "/{id}/cancelar",
    response_model=PedidoRead,
    status_code=status.HTTP_200_OK,
    summary="Cancelar pedido propio en estado PENDIENTE (Cliente)"
)
def cancelar_pedido_propio(
    id: int,
    current_user: Usuario = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service)
) -> PedidoRead:
    """
    Permite al cliente dueño cancelar su pedido si aún está en estado PENDIENTE.
    Restituye el stock en la misma transacción (RN-03).
    """
    try:
        return service.cancelar_pedido_cliente(
            pedido_id=id,
            usuario_id=current_user.id
        )
    except PedidoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PedidoAjeno as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except TransicionInvalida as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

