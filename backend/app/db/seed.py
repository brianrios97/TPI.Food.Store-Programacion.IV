import logging
from sqlmodel import select
from app.core.database import create_all_tables
from app.core.security import get_password_hash
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("seed")

# Categorías recicladas del proyecto de Programación 3
CATEGORIAS_SEED = [
    {"nombre": "Pizzas", "descripcion": "Pizzas artesanales con masa fresca y horno de barro"},
    {"nombre": "Hamburguesas", "descripcion": "Hamburguesas gourmet con ingredientes frescos y carne premium"},
    {"nombre": "Bebidas", "descripcion": "Gaseosas, jugos naturales y bebidas frías"},
    {"nombre": "Postres", "descripcion": "Tortas, helados y dulces artesanales"},
    {"nombre": "Empanadas", "descripcion": "Empanadas horneadas y fritas de distintos sabores"},
    {"nombre": "Ensaladas", "descripcion": "Ensaladas frescas y saludables"},
    {"nombre": "Papas Fritas", "descripcion": "Papas bastón crocantes y porciones para compartir"}
]

# Catálogo completo reciclado del TP con imágenes locales de assets
PRODUCTOS_SEED = [
    {
        "nombre": "Pizza Muzzarella",
        "precio_base": 4500.0,
        "descripcion": "Pizza clásica con salsa de tomate y muzzarella derretida",
        "stock": 25,
        "imagen_url": "/assets/pizza_muzza.jpg",
        "disponible": True,
        "categoria_nombre": "Pizzas"
    },
    {
        "nombre": "Pizza Napolitana",
        "precio_base": 5200.0,
        "descripcion": "Pizza con rodajas de tomate fresco, ajo y albahaca",
        "stock": 20,
        "imagen_url": "/assets/pizza_napo.jpg",
        "disponible": True,
        "categoria_nombre": "Pizzas"
    },
    {
        "nombre": "Pizza Especial 4 Quesos",
        "precio_base": 6800.0,
        "descripcion": "Muzzarella, provolone, roquefort y parmesano",
        "stock": 15,
        "imagen_url": "/assets/pizza_4_quesos.jpg",
        "disponible": True,
        "categoria_nombre": "Pizzas"
    },
    {
        "nombre": "Pizza Fugazzeta",
        "precio_base": 5500.0,
        "descripcion": "Pizza rellena de muzzarella con cebolla caramelizada",
        "stock": 18,
        "imagen_url": "/assets/pizza_fugazzeta.jpg",
        "disponible": True,
        "categoria_nombre": "Pizzas"
    },
    {
        "nombre": "Hamburguesa Clásica",
        "precio_base": 3800.0,
        "descripcion": "Medallón de carne 150g, lechuga, tomate, cebolla y mayonesa",
        "stock": 35,
        "imagen_url": "/assets/hamburguesa.jpg",
        "disponible": True,
        "categoria_nombre": "Hamburguesas"
    },
    {
        "nombre": "Hamburguesa BBQ Bacon",
        "precio_base": 5100.0,
        "descripcion": "Doble medallón 150g c/u, cheddar, bacon crocante y barbacoa",
        "stock": 30,
        "imagen_url": "/assets/hamburguesa_bbq.jpg",
        "disponible": True,
        "categoria_nombre": "Hamburguesas"
    },
    {
        "nombre": "Hamburguesa Veggie",
        "precio_base": 4200.0,
        "descripcion": "Medallón de lentejas y garbanzo, cheddar vegano y rúcula",
        "stock": 20,
        "imagen_url": "/assets/hamburguesa_veggie.jpg",
        "disponible": True,
        "categoria_nombre": "Hamburguesas"
    },
    {
        "nombre": "Hamburguesa Crispy Chicken",
        "precio_base": 4600.0,
        "descripcion": "Pollo apanado crocante, coleslaw y salsa honey mustard",
        "stock": 25,
        "imagen_url": "/assets/hamburguesa_crispy.png",
        "disponible": True,
        "categoria_nombre": "Hamburguesas"
    },
    {
        "nombre": "Coca-Cola 500ml",
        "precio_base": 1200.0,
        "descripcion": "Gaseosa Coca-Cola fría, botella personal 500ml",
        "stock": 100,
        "imagen_url": "/assets/coca.jpg",
        "disponible": True,
        "categoria_nombre": "Bebidas"
    },
    {
        "nombre": "Jugo de Naranja Natural",
        "precio_base": 1800.0,
        "descripcion": "Jugo exprimido en el momento, vaso 400ml",
        "stock": 40,
        "imagen_url": "/assets/jugo_naranja.jpg",
        "disponible": True,
        "categoria_nombre": "Bebidas"
    },
    {
        "nombre": "Agua Mineral 500ml",
        "precio_base": 800.0,
        "descripcion": "Agua mineral sin gas, botella personal 500ml",
        "stock": 150,
        "imagen_url": "/assets/agua_500ml.jpg",
        "disponible": True,
        "categoria_nombre": "Bebidas"
    },
    {
        "nombre": "Torta Rogel",
        "precio_base": 3500.0,
        "descripcion": "Torta rogel tradicional con dulce de leche y merengue italiano",
        "stock": 12,
        "imagen_url": "/assets/tarta_rogel.jpg",
        "disponible": True,
        "categoria_nombre": "Postres"
    },
    {
        "nombre": "Helado Artesanal 2 gustos",
        "precio_base": 2800.0,
        "descripcion": "Pote de 250g con 2 gustos a elección artesanal",
        "stock": 30,
        "imagen_url": "/assets/helado_artesanal.jpg",
        "disponible": True,
        "categoria_nombre": "Postres"
    },
    {
        "nombre": "Brownie con Helado",
        "precio_base": 2200.0,
        "descripcion": "Brownie de chocolate tibio con bocha de helado de vainilla",
        "stock": 15,
        "imagen_url": "/assets/brownie_helado.jpg",
        "disponible": True,
        "categoria_nombre": "Postres"
    },
    {
        "nombre": "Empanadas de Carne x6",
        "precio_base": 3000.0,
        "descripcion": "Empanadas criollas de carne cortada a cuchillo, horneadas",
        "stock": 50,
        "imagen_url": "/assets/empanadas_carne.jpg",
        "disponible": True,
        "categoria_nombre": "Empanadas"
    },
    {
        "nombre": "Empanadas de Pollo x6",
        "precio_base": 2800.0,
        "descripcion": "Empanadas de pollo desmenuzado con morrón y verdeo",
        "stock": 45,
        "imagen_url": "/assets/empanadas_pollo.jpg",
        "disponible": True,
        "categoria_nombre": "Empanadas"
    },
    {
        "nombre": "Empanadas de Jamón y Queso x6",
        "precio_base": 2500.0,
        "descripcion": "Empanadas fritas con jamón cocido seleccionado y queso fundido",
        "stock": 60,
        "imagen_url": "/assets/empanadas_jamon.jpg",
        "disponible": True,
        "categoria_nombre": "Empanadas"
    },
    {
        "nombre": "Ensalada César",
        "precio_base": 3200.0,
        "descripcion": "Lechuga romana, crutones crocantes, parmesano y aderezo césar",
        "stock": 20,
        "imagen_url": "/assets/ensalada_cesar.jpg",
        "disponible": True,
        "categoria_nombre": "Ensaladas"
    },
    {
        "nombre": "Ensalada Caprese",
        "precio_base": 2900.0,
        "descripcion": "Tomate, muzzarella fresca en cubos, albahaca y aceite de oliva",
        "stock": 18,
        "imagen_url": "/assets/ensalada_caprese.jpg",
        "disponible": True,
        "categoria_nombre": "Ensaladas"
    },
    {
        "nombre": "Ensalada Mixta",
        "precio_base": 2400.0,
        "descripcion": "Lechuga fresca, tomate en rodajas, zanahoria rallada y aceitunas",
        "stock": 25,
        "imagen_url": "/assets/ensalada_mixta.jpg",
        "disponible": True,
        "categoria_nombre": "Ensaladas"
    },
    {
        "nombre": "Papas Fritas Clásicas",
        "precio_base": 2500.0,
        "descripcion": "Papas bastón crocantes doradas con sal parrillera",
        "stock": 50,
        "imagen_url": "/assets/papas.jpg",
        "disponible": True,
        "categoria_nombre": "Papas Fritas"
    }
]


def seed_database() -> None:
    """
    Script idempotente de carga inicial de datos.
    Crea las tablas, el usuario admin, un usuario cliente de prueba,
    las 5 categorías y los 19 productos con stock.
    """
    logger.info("Verificando y creando tablas de base de datos...")
    create_all_tables()

    with UnitOfWork() as uow:
        # 1. Crear usuario Administrador (admin / Admin1234!)
        admin = uow.session.exec(select(Usuario).where(Usuario.username == "admin")).first()
        if not admin:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=get_password_hash("Admin1234!"),
                role="admin",
                disabled=False
            )
            uow.session.add(admin)
            logger.info("Usuario administrador creado: admin / Admin1234!")
        else:
            logger.info("Usuario administrador ya existe.")

        # 2. Crear usuario Cliente de prueba (cliente / Cliente1234!)
        cliente = uow.session.exec(select(Usuario).where(Usuario.username == "cliente")).first()
        if not cliente:
            cliente = Usuario(
                username="cliente",
                full_name="Cliente de Prueba",
                email="cliente@foodstore.com",
                hashed_password=get_password_hash("Cliente1234!"),
                role="user",
                disabled=False
            )
            uow.session.add(cliente)
            logger.info("Usuario cliente creado: cliente / Cliente1234!")
        else:
            logger.info("Usuario cliente ya existe.")

        # 3. Cargar Categorías
        cat_map = {}
        for c_data in CATEGORIAS_SEED:
            cat = uow.session.exec(select(Categoria).where(Categoria.nombre == c_data["nombre"])).first()
            if not cat:
                cat = Categoria(
                    nombre=c_data["nombre"],
                    descripcion=c_data["descripcion"],
                    activo=True
                )
                uow.session.add(cat)
                uow.session.flush()
                logger.info(f"Categoría creada: {cat.nombre}")
            cat_map[cat.nombre] = cat.id

        # 4. Cargar o Actualizar Productos
        for p_data in PRODUCTOS_SEED:
            cat_id = cat_map.get(p_data["categoria_nombre"])
            if not cat_id:
                continue
            prod = uow.session.exec(select(Producto).where(Producto.nombre == p_data["nombre"])).first()
            if not prod:
                prod = Producto(
                    nombre=p_data["nombre"],
                    descripcion=p_data["descripcion"],
                    precio_base=p_data["precio_base"],
                    stock=p_data["stock"],
                    imagen_url=p_data["imagen_url"],
                    disponible=p_data["disponible"],
                    activo=True,
                    categoria_id=cat_id
                )
                uow.session.add(prod)
                logger.info(f"Producto creado: {prod.nombre} (${prod.precio_base})")
            else:
                prod.imagen_url = p_data["imagen_url"]
                prod.precio_base = p_data["precio_base"]
                prod.descripcion = p_data["descripcion"]
                prod.stock = p_data["stock"]
                prod.categoria_id = cat_id
                prod.disponible = p_data["disponible"]
                prod.activo = True
                uow.session.add(prod)
                logger.info(f"Producto actualizado: {prod.nombre} -> {prod.imagen_url}")

        logger.info("Carga de datos semilla completada con éxito.")


if __name__ == "__main__":
    seed_database()
