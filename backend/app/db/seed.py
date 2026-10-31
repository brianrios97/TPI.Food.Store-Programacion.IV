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
    {"nombre": "Hamburguesas", "descripcion": "Hamburguesas artesanales con carne premium"},
    {"nombre": "Pizzas", "descripcion": "Pizzas al horno de barro con masa madre"},
    {"nombre": "Empanadas", "descripcion": "Empanadas caseras horneadas al estilo tradicional"},
    {"nombre": "Bebidas", "descripcion": "Bebidas frías, gaseosas y cervezas"},
    {"nombre": "Papas Fritas", "descripcion": "Acompañamientos crujientes y porciones para compartir"}
]

# Catálogo completo reciclado de Programación 3 (19 productos con stock y fotos reales)
PRODUCTOS_SEED = [
    {
        "nombre": "Hamburguesa Clásica",
        "precio_base": 4500.0,
        "descripcion": "Carne 150g, lechuga, tomate, cebolla morada y mayonesa",
        "stock": 50,
        "imagen_url": "https://foodish-api.com/images/burger/burger1.jpg",
        "disponible": True,
        "categoria_nombre": "Hamburguesas"
    },
    {
        "nombre": "Hamburguesa Doble",
        "precio_base": 6200.0,
        "descripcion": "Doble carne 150g c/u, cheddar, panceta y salsa barbacoa",
        "stock": 40,
        "imagen_url": "https://foodish-api.com/images/burger/burger2.jpg",
        "disponible": True,
        "categoria_nombre": "Hamburguesas"
    },
    {
        "nombre": "Hamburguesa Completa",
        "precio_base": 5500.0,
        "descripcion": "Carne 150g, huevo, jamón, queso, lechuga y tomate",
        "stock": 30,
        "imagen_url": "https://foodish-api.com/images/burger/burger3.jpg",
        "disponible": True,
        "categoria_nombre": "Hamburguesas"
    },
    {
        "nombre": "Hamburguesa Veggie",
        "precio_base": 5000.0,
        "descripcion": "Medallón de lentejas y quinoa, rúcula, tomate confitado y hummus",
        "stock": 20,
        "imagen_url": "https://imgs.search.brave.com/vUU8kRyBw8UOoDFUuZja2znED53OJK7yhKK0fOgySrg/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/aG9sYS5jb20vaG9y/aXpvbi9sYW5kc2Nh/cGUvNWYyY2RlMjUz/ODExLWhhbWJ1cmd1/ZXNhcy12ZWdnaWVz/LXQuanBnP2ltPVJl/c2l6ZT0oNjQwKSx0/eXBlPWRvd25zaXpl",
        "disponible": True,
        "categoria_nombre": "Hamburguesas"
    },
    {
        "nombre": "Pizza Mozzarella",
        "precio_base": 3800.0,
        "descripcion": "Mozzarella, salsa de tomate y orégano",
        "stock": 25,
        "imagen_url": "https://foodish-api.com/images/pizza/pizza1.jpg",
        "disponible": True,
        "categoria_nombre": "Pizzas"
    },
    {
        "nombre": "Pizza Napolitana",
        "precio_base": 4500.0,
        "descripcion": "Mozzarella, rodajas de tomate, ajo, aceitunas y albahaca",
        "stock": 25,
        "imagen_url": "https://foodish-api.com/images/pizza/pizza2.jpg",
        "disponible": True,
        "categoria_nombre": "Pizzas"
    },
    {
        "nombre": "Pizza Fugazzeta",
        "precio_base": 4800.0,
        "descripcion": "Mozzarella, cebolla caramelizada, jamón y aceitunas",
        "stock": 20,
        "imagen_url": "https://foodish-api.com/images/pizza/pizza3.jpg",
        "disponible": True,
        "categoria_nombre": "Pizzas"
    },
    {
        "nombre": "Pizza Especial",
        "precio_base": 5200.0,
        "descripcion": "Mozzarella, pepperoni, morrón, cebolla, huevo y aceitunas",
        "stock": 15,
        "imagen_url": "https://foodish-api.com/images/pizza/pizza4.jpg",
        "disponible": True,
        "categoria_nombre": "Pizzas"
    },
    {
        "nombre": "Empanada de Carne",
        "precio_base": 1200.0,
        "descripcion": "Carne picada, cebolla, huevo duro, aceitunas y especias",
        "stock": 100,
        "imagen_url": "https://imgs.search.brave.com/59eMoaWJDRojEIbZWP0bDyOXFyd-uZ67f1Od9J5OdJo/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9pbWFn/LmJvbnZpdmV1ci5j/b20vZW1wYW5hZGFz/LWFyZ2VudGluYXMt/ZGUtY2FybmUtZm90/by1jZXJjYS5qcGc",
        "disponible": True,
        "categoria_nombre": "Empanadas"
    },
    {
        "nombre": "Empanada de Pollo",
        "precio_base": 1200.0,
        "descripcion": "Pollo desmenuzado, cebolla, morrón y crema",
        "stock": 80,
        "imagen_url": "https://imgs.search.brave.com/rzKU68f-NWlQMA1gEaSdY5ToiVPImNEDEeyt91Mu3V8/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly93d3cu/c3VwZXJwb2xsby5j/bC9pbWcvcmVjZXRh/cy9lbXBhbmFkYXMt/ZGUtcG9sbG8ud2Vi/cA",
        "disponible": True,
        "categoria_nombre": "Empanadas"
    },
    {
        "nombre": "Empanada Jamón y Queso",
        "precio_base": 1100.0,
        "descripcion": "Jamón cocido y mozzarella",
        "stock": 90,
        "imagen_url": "https://imgs.search.brave.com/7oHPZkFZ8_QQGTD7jyuHPv22MkZ0XOCuew9a7chmD3g/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMucmFwcGkuY29t/LmFyL3Byb2R1Y3Rz/L2Y1MWFiMWI4LTdh/MzUtNGZkZi1hYWRm/LWQyNmJmYjcyYTRk/NS5wbmc_ZD0zMDB4/MzAwJmU9d2VicCZx/PTEw",
        "disponible": True,
        "categoria_nombre": "Empanadas"
    },
    {
        "nombre": "Empanada de Verdura",
        "precio_base": 1100.0,
        "descripcion": "Espinaca, acelga, ricota y nuez moscada",
        "stock": 60,
        "imagen_url": "https://imgs.search.brave.com/CFN-cLWHvGEPaFwXsHGF1B06YLGa6dL6reSjESWoM1w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9yZWNl/dGFzbmF0dXJhLmNv/bS5hci9zaXRlcy9y/ZWNldGFzbmF0dXJh/L2ZpbGVzL25hdHVy/YS1mb3Rvcy13ZWIt/ZW5lcm8tNjU1eDQ3/NWVtcGFuYWRhc19k/ZV92ZXJkdXJhLmpw/Zw",
        "disponible": True,
        "categoria_nombre": "Empanadas"
    },
    {
        "nombre": "Coca-Cola 500ml",
        "precio_base": 1500.0,
        "descripcion": "Gaseosa Coca-Cola original 500ml",
        "stock": 200,
        "imagen_url": "https://imgs.search.brave.com/mpy_eqy5amQNhruIs_nGxxc5r3OB_e72krEXhJoEY1M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/dmlhdHJlbnRvLmNv/bS5hci90aHVtYi8w/MDAwMDAwMDAwMDAx/MDY5NTUwMjI1NUEw/NkIzNC0yNjQ0LTRG/ODQtOUZFOS1DMDEz/RjQxMjA5N0EtMS0y/MDEtYV84MDB4ODAw/LmpwZWc",
        "disponible": True,
        "categoria_nombre": "Bebidas"
    },
    {
        "nombre": "Sprite 500ml",
        "precio_base": 1500.0,
        "descripcion": "Gaseosa Sprite 500ml",
        "stock": 180,
        "imagen_url": "https://imgs.search.brave.com/A1KRBI3zvXKrym5ebbQizCZ8t2IdCKJF2fxiAastZ1A/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9odHRw/Mi5tbHN0YXRpYy5j/b20vRF9RX05QXzJY/XzcxMTMzNi1NTEE4/OTE0OTYxOTU0M18w/ODIwMjUtVi53ZWJw",
        "disponible": True,
        "categoria_nombre": "Bebidas"
    },
    {
        "nombre": "Agua Mineral 500ml",
        "precio_base": 1000.0,
        "descripcion": "Agua mineral sin gas 500ml",
        "stock": 300,
        "imagen_url": "https://dispandistribuidora.agilecdn.com.br/8211_1.jpg?v=338-3114143016",
        "disponible": True,
        "categoria_nombre": "Bebidas"
    },
    {
        "nombre": "Cerveza Artesanal 473ml",
        "precio_base": 2500.0,
        "descripcion": "Cerveza artesanal rubia 473ml",
        "stock": 100,
        "imagen_url": "https://imgs.search.brave.com/SpDJCdalR7edohOLzhzqCCD0Qbaz5l-BC07in3yPWXY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9pZGVu/dGlmaWNhY2klQzMl/QjNuLW9zY3VyYS1k/ZS1sYS1jZXJ2ZXph/LWRlbC1hcnRlLWVs/LXZpZHJpby00NDA1/MzcyMC5qcGc",
        "disponible": True,
        "categoria_nombre": "Bebidas"
    },
    {
        "nombre": "Papas Fritas Clásicas",
        "precio_base": 2500.0,
        "descripcion": "Papas fritas bastón crocantes con sal parrillera",
        "stock": 70,
        "imagen_url": "https://imgs.search.brave.com/in2PgvEBAwflH6lKfKgmkhjM5zsAZt_5CCF9WkXKB1Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAzLzc0LzE4LzIw/LzM2MF9GXzM3NDE4/MjA3N19oS3ZLS2pL/YW5JZkFacW4wSzhV/WUE3M2FIejZGTXo5/dC5qcGc",
        "disponible": True,
        "categoria_nombre": "Papas Fritas"
    },
    {
        "nombre": "Papas con Cheddar y Panceta",
        "precio_base": 3500.0,
        "descripcion": "Papas fritas bañadas en cheddar y panceta crocante",
        "stock": 50,
        "imagen_url": "https://imgs.search.brave.com/tK-SyeGMUaiGUWpfNv8IlBMG7CDpcdQyFoF9zzxS3Os/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tb3Jp/eGUuY29tLmFyL2Zp/bGVzL3JlY2V0YXMv/dGh1bWJzL3BhcGFz/Y2hlZGRhcm1vcml4/ZTAyLmpwZw",
        "disponible": True,
        "categoria_nombre": "Papas Fritas"
    },
    {
        "nombre": "Aros de Cebolla",
        "precio_base": 2800.0,
        "descripcion": "Aros de cebolla empanizados, servidos con salsa barbacoa",
        "stock": 40,
        "imagen_url": "https://imgs.search.brave.com/MbIsq2iRx49GR24H-kWPDldGSqyiU7O9Xzc1JGEw0_Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93d3cu/Y2xhcmluLmNvbS9p/bWcvMTk2OS8xMi8z/MS9Ia1JQTEdKRWxf/MTI1Nng2MjBfXzEu/anBnIzE1ODQxMTM5/ODY3NDM",
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

        # 4. Cargar Productos
        for p_data in PRODUCTOS_SEED:
            prod = uow.session.exec(select(Producto).where(Producto.nombre == p_data["nombre"])).first()
            if not prod:
                cat_id = cat_map.get(p_data["categoria_nombre"])
                if cat_id:
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

        logger.info("Carga de datos semilla completada con éxito.")


if __name__ == "__main__":
    seed_database()
