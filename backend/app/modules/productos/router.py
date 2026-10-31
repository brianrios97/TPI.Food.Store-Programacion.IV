from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoUpdate,
    ProductoStockUpdate,
    ProductoRead,
    ProductosPaginados
)
from app.modules.productos.service import (
    ProductoService,
    ProductoNoEncontrado,
    CategoriaNoEncontrada
)

router = APIRouter(prefix="/productos", tags=["Productos"])


def get_producto_service() -> ProductoService:
    """Inyección de dependencias para el servicio de productos."""
    return ProductoService()


@router.get(
    "",
    response_model=ProductosPaginados,
    status_code=status.HTTP_200_OK,
    summary="Listar productos activos paginados con filtros (Público)"
)
def list_productos(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    search: Optional[str] = Query(default=None),
    categoria_id: Optional[int] = Query(default=None),
    disponible: Optional[bool] = Query(default=None),
    service: ProductoService = Depends(get_producto_service)
) -> ProductosPaginados:
    """
    Retorna el catálogo paginado de productos activos.
    Permite búsqueda case-insensitive por nombre y filtrado por categoría y disponibilidad.
    """
    return service.search(
        skip=skip,
        limit=limit,
        search=search,
        categoria_id=categoria_id,
        disponible=disponible
    )


@router.get(
    "/{id}",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
    summary="Detalle de un producto con su categoría (Público)"
)
def get_producto(
    id: int,
    service: ProductoService = Depends(get_producto_service)
) -> ProductoRead:
    """Retorna el detalle completo de un producto activo."""
    try:
        return service.get_by_id(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "",
    response_model=ProductoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear producto (Admin)"
)
def create_producto(
    data: ProductoCreate,
    _: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service)
) -> ProductoRead:
    """Crea un nuevo producto asignado a una categoría existente y activa."""
    try:
        return service.create(data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put(
    "/{id}",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
    summary="Actualizar producto (Admin)"
)
def update_producto(
    id: int,
    data: ProductoUpdate,
    _: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service)
) -> ProductoRead:
    """Actualiza parcialmente los campos enviados de un producto."""
    try:
        return service.update(id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch(
    "/{id}/stock",
    response_model=ProductoRead,
    status_code=status.HTTP_200_OK,
    summary="Actualizar stock y disponibilidad (Admin)"
)
def update_stock(
    id: int,
    data: ProductoStockUpdate,
    _: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service)
) -> ProductoRead:
    """Actualización rápida de stock y estado disponible para control de cocina o depósito."""
    try:
        return service.update_stock(id, data)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Baja lógica de producto (Admin)"
)
def delete_producto(
    id: int,
    _: Usuario = Depends(require_role(["admin"])),
    service: ProductoService = Depends(get_producto_service)
) -> Response:
    """Realiza la baja lógica de un producto (activo = False). Responde 204 sin cuerpo."""
    try:
        service.delete(id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

