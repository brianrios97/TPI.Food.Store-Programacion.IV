from typing import Callable, Optional
from sqlmodel import Session
from app.core.database import session_factory


class UnitOfWork:
    """
    Clase Unit of Work base.
    Implementa el protocolo de Context Manager (__enter__ y __exit__) para
    garantizar transacciones atómicas (ACID) y gestionar el ciclo de vida de la sesión.
    """

    def __init__(self, session_creator: Callable[[], Session] = session_factory) -> None:
        self.session_creator = session_creator
        self.session: Optional[Session] = None

    def __enter__(self) -> "UnitOfWork":
        """
        Se ejecuta automáticamente al entrar en el bloque 'with self.uow as uow:'.
        Abre una nueva sesión de base de datos para la transacción.
        """
        self.session = self.session_creator()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        """
        Se ejecuta automáticamente al salir del bloque 'with':
        - Si hubo una excepción (exc_type is not None): hace rollback().
        - Si no hubo excepciones: hace commit().
        - Finalmente: siempre cierra la sesión con close() para liberar la conexión al pool.
        """
        try:
            if exc_type is not None:
                self.rollback()
            else:
                self.commit()
        finally:
            self.close()

    def commit(self) -> None:
        """Confirma los cambios en la base de datos."""
        if self.session:
            self.session.commit()

    def rollback(self) -> None:
        """Revierte cualquier cambio pendiente si ocurrió un error."""
        if self.session:
            self.session.rollback()

    def close(self) -> None:
        """Cierra la sesión y retorna la conexión al pool de base de datos."""
        if self.session:
            self.session.close()

