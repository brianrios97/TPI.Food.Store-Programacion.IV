from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

# Creación de la instancia principal de FastAPI
app = FastAPI(
    title="Food Store API",
    description="API REST para sistema de pedidos de comida - Programación IV (UTN)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración de CORS con credenciales (Permite que viajen las cookies HttpOnly)
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router principal con prefijo global /api/v1 según consigna
api_router = APIRouter(prefix="/api/v1")

@api_router.get("/health", tags=["Salud"])
def health_check():
    """Endpoint para verificar que el servicio está activo y respondiendo."""
    return {"status": "ok", "app": "Food Store API", "version": "1.0.0"}

# Registro del router en la app
app.include_router(api_router)

