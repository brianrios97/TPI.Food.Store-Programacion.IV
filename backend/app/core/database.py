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

def init_models() -> None:
    """
    Importa todos los modelos de dominio para que el registro de SQLAlchemy
    resuelva las referencias entre clases en las relaciones (Relationship).
    """
    import app.modules.usuarios.models  # noqa: F401
    import app.modules.categorias.models  # noqa: F401
    import app.modules.productos.models  # noqa: F401
    import app.modules.pedidos.models  # noqa: F401


def session_factory() -> Session:
    """
    Crea y retorna una nueva sesión de base de datos.
    expire_on_commit=False evita DetachedInstanceError al acceder a atributos
    después de que el Unit of Work ejecuta commit() y cierra la sesión.
    """
    return Session(engine, expire_on_commit=False)


def create_all_tables() -> None:
    """
    Crea todas las tablas registradas en SQLModel.metadata en la base de datos.
    Es idempotente: si las tablas ya existen, no hace nada.
    """
    init_models()
    SQLModel.metadata.create_all(engine)

