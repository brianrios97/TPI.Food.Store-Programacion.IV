from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

# Ubicación absoluta de la carpeta backend para localizar siempre el archivo .env
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    """
    Configuración global de la aplicación.
    Lee las variables de entorno desde el archivo .env o variables del sistema.
    """
    DATABASE_URL: str = "sqlite:///./foodstore.db"
    SECRET_KEY: str = "cambiar-esta-clave-de-al-menos-32-caracteres"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=(str(ENV_FILE), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instancia singleton accesible desde cualquier módulo
settings = Settings()

