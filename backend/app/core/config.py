from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Ubicación absoluta de la carpeta backend para localizar siempre el archivo .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"
DEFAULT_DB_FILE = (BASE_DIR / "foodstore.db").as_posix()

class Settings(BaseSettings):
    """
    Configuración global de la aplicación.
    Lee las variables de entorno desde el archivo .env o variables del sistema.
    """
    DATABASE_URL: str = f"sqlite:///{DEFAULT_DB_FILE}"
    SECRET_KEY: str = "cambiar-esta-clave-de-al-menos-32-caracteres"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    @property
    def resolved_database_url(self) -> str:
        if self.DATABASE_URL.startswith("sqlite:///./"):
            rel_file = self.DATABASE_URL.replace("sqlite:///./", "")
            return f"sqlite:///{(BASE_DIR / rel_file).as_posix()}"
        return self.DATABASE_URL

    model_config = SettingsConfigDict(
        env_file=(str(ENV_FILE), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instancia singleton accesible desde cualquier módulo
settings = Settings()

