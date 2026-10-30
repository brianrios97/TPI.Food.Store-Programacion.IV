from datetime import datetime, timezone
from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    """
    Modelo de tabla para la entidad Usuario.
    Representa a los clientes y administradores del sistema.
    """
    __tablename__ = "usuario"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(unique=True, index=True, nullable=False)
    full_name: str = Field(nullable=False)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
    role: str = Field(default="user", nullable=False)  # "user" o "admin"
    disabled: bool = Field(default=False, nullable=False)  # Baja lógica
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relación 1:N con Pedidos (Usuario 1:N Pedido)
    pedidos: List["Pedido"] = Relationship(back_populates="usuario")

