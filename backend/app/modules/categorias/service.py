from typing import List
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    """Excepción lanzada cuando una categoría no existe o está dada de baja."""
    pass


class NombreDuplicado(Exception):
    """Excepción lanzada cuando se intenta usar un nombre de categoría ya registrado."""
    pass


class CategoriaService:
    """
    Servicio de dominio para la gestión de categorías.
    Aplica las reglas de negocio y garantiza que el schema se devuelva dentro del UoW.
    """

    def __init__(self, uow: CategoriaUnitOfWork | None = None) -> None:
        self.uow = uow or CategoriaUnitOfWork()

    def list_activas(self) -> List[CategoriaRead]:
        """Retorna todas las categorías activas para el catálogo público."""
        with self.uow as uow:
            categorias = uow.categorias.get_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def get_by_id(self, categoria_id: int) -> CategoriaRead:
        """
        Obtiene el detalle de una categoría activa por su ID.
        Si no existe o está dada de baja, lanza CategoriaNoEncontrada.
        """
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada(f"Categoría con ID {categoria_id} no encontrada")
            return CategoriaRead.model_validate(categoria)

    def create(self, data: CategoriaCreate) -> CategoriaRead:
        """
        Crea una nueva categoría.
        Verifica que el nombre no esté repetido (ni siquiera entre las inactivas).
        """
        with self.uow as uow:
            existente = uow.categorias.get_by_nombre(data.nombre)
            if existente:
                raise NombreDuplicado(f"Ya existe una categoría con el nombre '{data.nombre}'")

            nueva = Categoria(
                nombre=data.nombre,
                descripcion=data.descripcion,
                activo=True
            )
            uow.categorias.add(nueva)
            return CategoriaRead.model_validate(nueva)

    def update(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        """
        Actualiza parcialmente una categoría activa.
        Si cambia el nombre, valida que no esté en uso por otra categoría.
        """
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada(f"Categoría con ID {categoria_id} no encontrada")

            if data.nombre is not None and data.nombre != categoria.nombre:
                existente = uow.categorias.get_by_nombre(data.nombre)
                if existente and existente.id != categoria_id:
                    raise NombreDuplicado(f"Ya existe una categoría con el nombre '{data.nombre}'")
                categoria.nombre = data.nombre

            if data.descripcion is not None:
                categoria.descripcion = data.descripcion

            uow.categorias.add(categoria)
            return CategoriaRead.model_validate(categoria)

    def delete(self, categoria_id: int) -> None:
        """
        Baja lógica de una categoría (activo = False).
        Responde 404 si la categoría no existe o ya está dada de baja.
        """
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)
            if not categoria or not categoria.activo:
                raise CategoriaNoEncontrada(f"Categoría con ID {categoria_id} no encontrada")

            categoria.activo = False
            uow.categorias.add(categoria)

