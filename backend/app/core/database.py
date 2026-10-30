from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

# Argumentos de conexión especiales según el motor de base de datos
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    # Necesario para SQLite en aplicaciones multihilo como FastAPI
    connect_args["check_same_thread"] = False

# Creación del engine (motor de conexión)
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,  # Cambiar a True si se desea ver cada consulta SQL en la consola
    connect_args=connect_args
)

def session_factory() -> Session:
    """
    Crea y retorna una nueva sesión de base de datos.
    Es utilizada por el Unit of Work para gestionar transacciones atómicas.
    """
    return Session(engine)

def create_all_tables() -> None:
    """
    Crea todas las tablas registradas en SQLModel.metadata en la base de datos.
    Es idempotente: si las tablas ya existen, no hace nada.
    """
    SQLModel.metadata.create_all(engine)

