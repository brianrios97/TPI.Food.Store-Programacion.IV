from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response, status
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.modules.categorias.service import (
    CategoriaService,
    CategoriaNoEncontrada,
    NombreDuplicado
)

router = APIRouter(prefix="/categorias", tags=["Categorías"])


def get_categoria_service() -> CategoriaService:
    """Inyección de dependencias para el servicio de categorías."""
    return CategoriaService()


@router.get(
    "",
    response_model=List[CategoriaRead],
    status_code=status.HTTP_200_OK,
    summary="Listar categorías activas (Público)"
)
def list_categorias(
    service: CategoriaService = Depends(get_categoria_service)
) -> List[CategoriaRead]:
    """Retorna todas las categorías disponibles y activas en el catálogo."""
    return service.list_activas()


@router.get(
    "/{id}",
    response_model=CategoriaRead,
    status_code=status.HTTP_200_OK,
    summary="Detalle de una categoría (Público)"
)
def get_categoria(
    id: int,
    service: CategoriaService = Depends(get_categoria_service)
) -> CategoriaRead:
    """Retorna el detalle de una categoría activa por su ID."""
    try:
        return service.get_by_id(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear categoría (Admin)"
)
def create_categoria(
    data: CategoriaCreate,
    _: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service)
) -> CategoriaRead:
    """Crea una nueva categoría. El nombre debe ser único."""
    try:
        return service.create(data)
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put(
    "/{id}",
    response_model=CategoriaRead,
    status_code=status.HTTP_200_OK,
    summary="Actualizar categoría (Admin)"
)
def update_categoria(
    id: int,
    data: CategoriaUpdate,
    _: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service)
) -> CategoriaRead:
    """Actualiza parcialmente una categoría activa."""
    try:
        return service.update(id, data)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Baja lógica de categoría (Admin)"
)
def delete_categoria(
    id: int,
    _: Usuario = Depends(require_role(["admin"])),
    service: CategoriaService = Depends(get_categoria_service)
) -> Response:
    """Realiza la baja lógica de una categoría (activo = False). Responde 204 sin cuerpo."""
    try:
        service.delete(id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

