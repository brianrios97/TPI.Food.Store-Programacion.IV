from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_models
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.pedidos.router import router as pedidos_router

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

# Inicializar registro de modelos de base de datos
init_models()

# Router principal con prefijo global /api/v1 según consigna
api_router = APIRouter(prefix="/api/v1")

@api_router.get("/health", tags=["Salud"])
def health_check():
    """Endpoint para verificar que el servicio está activo y respondiendo."""
    return {"status": "ok", "app": "Food Store API", "version": "1.0.0"}

# Inclusión de routers modulares bajo /api/v1
api_router.include_router(auth_router)
api_router.include_router(usuarios_router)
api_router.include_router(categorias_router)
api_router.include_router(productos_router)
api_router.include_router(pedidos_router)

# Registro del router en la app
app.include_router(api_router)

