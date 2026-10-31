from datetime import datetime, timezone
from typing import Optional, List, Dict
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork


# Excepciones de Dominio (Página 11 de la consigna)
class PedidoNoEncontrado(Exception):
    pass


class ProductoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class TransicionInvalida(Exception):
    pass


# Diccionario con el mapa oficial de transiciones de estado (RN-02)
TRANSICIONES_VALIDAS: Dict[str, List[str]] = {
    "PENDIENTE": ["EN_PREPARACION", "CANCELADO"],
    "EN_PREPARACION": ["ENTREGADO", "CANCELADO"],
    "ENTREGADO": [],  # Terminal
    "CANCELADO": []   # Terminal
}


class PedidoService:
    """
    Servicio de dominio para la gestión del ciclo de vida de los pedidos.
    Aplica las reglas de negocio transaccionales RN-01 a RN-06.
    """

    def __init__(self, uow: PedidoUnitOfWork | None = None) -> None:
        self.uow = uow or PedidoUnitOfWork()

    def crear_pedido(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        """
        RN-01: Creación atómica del pedido desde el carrito.
        Verifica stock, lo descuenta, calcula totales y persiste la copia histórica.
        """
        # 1. Validar que no haya IDs de producto duplicados en el listado
        product_ids = [item.producto_id for item in data.items]
        if len(product_ids) != len(set(product_ids)):
            raise ProductoRepetido("No se permiten productos repetidos en el pedido")

        with self.uow as uow:
            # 2. Instanciar el pedido inicial en PENDIENTE
            ahora = datetime.now(timezone.utc)
            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
                created_at=ahora,
                updated_at=ahora
            )
            uow.pedidos.add(pedido)

            total_acumulado = 0.0

            # 3. Iterar cada ítem del carrito
            for item in data.items:
                producto = uow.productos.get_by_id(item.producto_id)

                # Validar existencia y que esté activo
                if not producto or not producto.activo:
                    raise ProductoNoEncontrado(
                        f"Producto con ID {item.producto_id} no existe o no está activo"
                    )

                # Validar disponibilidad operativa
                if not producto.disponible:
                    raise ProductoNoDisponible(
                        f"El producto '{producto.nombre}' no se encuentra disponible actualmente"
                    )

                # Validar stock suficiente
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}'. "
                        f"Disponible: {producto.stock}, Solicitado: {item.cantidad}"
                    )

                # Descontar stock
                producto.stock -= item.cantidad
                uow.productos.add(producto)

                # Calcular subtotal y crear línea inmutable (RN-05)
                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal
                )
                uow.session.add(detalle)
                total_acumulado += subtotal

            # 4. Asignar total final del pedido
            pedido.total = round(total_acumulado, 2)
            uow.pedidos.add(pedido)

            # Sincronizar cambios en la sesión para que pedido.items esté poblado
            uow.session.flush()
            uow.session.refresh(pedido)

            # 5. Convertir a DTO dentro del bloque with
            return PedidoRead.model_validate(pedido)

    def cambiar_estado_admin(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """
        RN-02 y RN-03: Avance o cancelación de pedido por el administrador.
        Si se cancela, restituye el stock de todos los ítems en la misma transacción.
        """
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado(f"Pedido con ID {pedido_id} no encontrado")

            # Validar según máquina de estados
            validos = TRANSICIONES_VALIDAS.get(pedido.estado, [])
            if nuevo_estado not in validos:
                raise TransicionInvalida(
                    f"Transición no permitida de '{pedido.estado}' a '{nuevo_estado}'"
                )

            # Si pasa a CANCELADO, restituir stock (RN-03)
            if nuevo_estado == "CANCELADO":
                for linea in pedido.items:
                    prod = uow.productos.get_by_id(linea.producto_id)
                    if prod:
                        prod.stock += linea.cantidad
                        uow.productos.add(prod)

            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)

            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar_pedido_cliente(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        """
        RN-03 y RN-04: Cancelación de pedido propio por el cliente.
        Solo permitido si el pedido pertenece al usuario y está en estado 'PENDIENTE'.
        """
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado(f"Pedido con ID {pedido_id} no encontrado")

            # Permisos: solo el dueño puede cancelar
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tiene permisos para modificar este pedido")

            # Solo permitido cancelar en PENDIENTE
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida(
                    f"No es posible cancelar el pedido en estado '{pedido.estado}'. "
                    f"El cliente solo puede cancelar pedidos en estado 'PENDIENTE'."
                )

            # Restituir stock (RN-03)
            for linea in pedido.items:
                prod = uow.productos.get_by_id(linea.producto_id)
                if prod:
                    prod.stock += linea.cantidad
                    uow.productos.add(prod)

            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            uow.pedidos.add(pedido)

            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def get_pedido(self, pedido_id: int, usuario: Usuario) -> PedidoRead:
        """
        RN-04: Obtiene el detalle de un pedido.
        Admin puede ver cualquiera; cliente solo puede ver los suyos.
        """
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if not pedido:
                raise PedidoNoEncontrado(f"Pedido con ID {pedido_id} no encontrado")

            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No tiene permisos para ver este pedido")

            return PedidoRead.model_validate(pedido)

    def list_pedidos(
        self,
        usuario: Usuario,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None
    ) -> PedidosPaginados:
        """
        RN-04: Lista pedidos paginados.
        Si es admin lista todos; si es cliente solo los suyos.
        """
        with self.uow as uow:
            usuario_id = None if usuario.role == "admin" else usuario.id
            total, items = uow.pedidos.list_by_usuario(
                usuario_id=usuario_id,
                skip=skip,
                limit=limit,
                estado=estado
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in items]
            )

    def get_resumen(self) -> ResumenPedidos:
        """Retorna las métricas del dashboard de administración."""
        with self.uow as uow:
            resumen_dict = uow.pedidos.get_resumen()
            return ResumenPedidos(**resumen_dict)

