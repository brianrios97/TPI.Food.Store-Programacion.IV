from typing import Optional, List, Tuple
from sqlmodel import Session, select, func
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    """
    Repositorio para la entidad Producto.
    Hereda operaciones CRUD y provee búsqueda paginada con filtros combinados.
    """

    def __init__(self, session: Session) -> None:
        super().__init__(session, Producto)

    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None
    ) -> Tuple[int, List[Producto]]:
        """
        Búsqueda paginada sobre productos activos con filtros opcionales:
        - search: Búsqueda parcial de texto sobre el nombre (case-insensitive).
        - categoria_id: Filtro exacto por ID de categoría.
        - disponible: Filtro booleano por disponibilidad operativa.
        Retorna una tupla: (total_registros_encontrados, lista_de_productos_de_la_pagina).
        """
        # Solo productos activos (baja lógica)
        query = select(Producto).where(Producto.activo == True)

        if search:
            query = query.where(func.lower(Producto.nombre).contains(search.lower()))

        if categoria_id is not None:
            query = query.where(Producto.categoria_id == categoria_id)

        if disponible is not None:
            query = query.where(Producto.disponible == disponible)

        # Conteo total de coincidencias para el cálculo de páginas
        count_statement = select(func.count()).select_from(query.subquery())
        total = self.session.exec(count_statement).one()

        # Aplicar paginación
        paged_statement = query.offset(skip).limit(limit)
        items = list(self.session.exec(paged_statement).all())

        return total, items

