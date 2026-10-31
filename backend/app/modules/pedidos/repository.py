from datetime import datetime, timezone, time
from typing import Optional, List, Tuple, Dict, Any
from sqlmodel import Session, select, func
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    """
    Repositorio para la entidad Pedido.
    Hereda operaciones CRUD y provee listados paginados por usuario/estado
    y cálculo de métricas para el panel de administración.
    """

    def __init__(self, session: Session) -> None:
        super().__init__(session, Pedido)

    def list_by_usuario(
        self,
        usuario_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None
    ) -> Tuple[int, List[Pedido]]:
        """
        Lista pedidos paginados.
        - Si usuario_id está presente, filtra solo pedidos propios del cliente.
        - Si usuario_id es None (modo admin), lista todos los pedidos del negocio.
        - Filtra opcionalmente por estado.
        - Ordena por fecha descendente (los más recientes primero).
        """
        query = select(Pedido)

        if usuario_id is not None:
            query = query.where(Pedido.usuario_id == usuario_id)

        if estado:
            query = query.where(Pedido.estado == estado)

        # Conteo total para paginación
        count_stmt = select(func.count()).select_from(query.subquery())
        total = self.session.exec(count_stmt).one()

        # Ordenar los más recientes primero y paginar
        paged_query = query.order_by(Pedido.created_at.desc()).offset(skip).limit(limit)
        items = list(self.session.exec(paged_query).all())

        return total, items

    def get_resumen(self) -> Dict[str, Any]:
        """
        Calcula las métricas del panel de administración utilizando func.count y func.sum.
        """
        # Conteos por estado
        def count_estado(est: str) -> int:
            stmt = select(func.count(Pedido.id)).where(Pedido.estado == est)
            return self.session.exec(stmt).one() or 0

        pendientes = count_estado("PENDIENTE")
        en_preparacion = count_estado("EN_PREPARACION")
        entregados = count_estado("ENTREGADO")
        cancelados = count_estado("CANCELADO")

        # Pedidos creados en el día de hoy (desde las 00:00:00 UTC)
        hoy_inicio = datetime.combine(datetime.now(timezone.utc).date(), time.min, tzinfo=timezone.utc)
        stmt_hoy = select(func.count(Pedido.id)).where(Pedido.created_at >= hoy_inicio)
        pedidos_hoy = self.session.exec(stmt_hoy).one() or 0

        # Ingresos totales solo de pedidos entregados (func.sum)
        stmt_ingresos = select(func.sum(Pedido.total)).where(Pedido.estado == "ENTREGADO")
        ingresos_raw = self.session.exec(stmt_ingresos).one()
        ingresos_entregados = float(ingresos_raw) if ingresos_raw is not None else 0.0

        return {
            "pendientes": pendientes,
            "en_preparacion": en_preparacion,
            "entregados": entregados,
            "cancelados": cancelados,
            "pedidos_hoy": pedidos_hoy,
            "ingresos_entregados": ingresos_entregados
        }
