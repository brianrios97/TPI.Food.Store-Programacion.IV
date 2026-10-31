import os
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    """Establece color de fondo de una celda."""
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tc_pr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Establece márgenes internos de una celda."""
    tc_pr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tc_pr.append(tcMar)

def create_guion_secuencial_docx(output_path: str):
    doc = Document()

    # Márgenes normales (1 pulgada = 2.54 cm)
    for section in doc.sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Estilo base
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x29, 0x25, 0x24)

    # --- PORTADA / ENCABEZADO ---
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    run_title = title_p.add_run("GUION SECUENCIAL DE GRABACIÓN PASO A PASO")
    run_title.font.name = 'Calibri'
    run_title.font.size = Pt(20)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0xD9, 0x77, 0x06) # amber-600

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_after = Pt(14)
    run_sub = sub_p.add_run("Food Store - Trabajo Práctico Integrador de Programación IV (UTN)")
    run_sub.font.size = Pt(13)
    run_sub.font.bold = True
    run_sub.font.color.rgb = RGBColor(0x1C, 0x19, 0x17)

    # Tabla de Datos
    meta_table = doc.add_table(rows=4, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False

    metadata = [
        ("Materia:", "Programación IV - Tecnicatura Universitaria en Programación (UTN)"),
        ("Autor / Alumno:", "Brian Emanuel Rios"),
        ("Repositorio GitHub:", "https://github.com/brianrios97/TPI.Food.Store-Programacion.IV"),
        ("Estructura del Guion:", "Formato en Paralelo: [Acción en Pantalla] seguido inmediatamente de [Lo que decís]")
    ]

    for idx, (label, val) in enumerate(metadata):
        row = meta_table.rows[idx]
        cell_lbl, cell_val = row.cells[0], row.cells[1]
        cell_lbl.width = Inches(2.0)
        cell_val.width = Inches(4.5)
        set_cell_background(cell_lbl, "F5F5F4")
        set_cell_background(cell_val, "FAFAF9")
        set_cell_margins(cell_lbl, top=70, bottom=70, left=100, right=100)
        set_cell_margins(cell_val, top=70, bottom=70, left=100, right=100)

        p_lbl = cell_lbl.paragraphs[0]
        p_lbl.paragraph_format.space_after = Pt(0)
        r_l = p_lbl.add_run(label)
        r_l.bold = True
        r_l.font.size = Pt(9.5)

        p_val = cell_val.paragraphs[0]
        p_val.paragraph_format.space_after = Pt(0)
        r_v = p_val.add_run(val)
        r_v.font.size = Pt(9.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    # Preparación previa
    h_prep = doc.add_paragraph()
    h_prep.paragraph_format.space_before = Pt(10)
    h_prep.paragraph_format.space_after = Pt(4)
    r_prep = h_prep.add_run("📋 Preparación Previa (Tener listo antes de presionar REC):")
    r_prep.font.size = Pt(12)
    r_prep.font.bold = True
    r_prep.font.color.rgb = RGBColor(0xB4, 0x53, 0x09)

    preps = [
        "Terminal 1: En carpeta backend con entorno activado (.venv\\Scripts\\activate).",
        "Terminal 2: En carpeta frontend lista para ejecutar pnpm build y pnpm dev.",
        "Pestañas del Navegador: Tab 1 en http://localhost:5173 (Food Store), Tab 2 en http://localhost:8000/docs (Swagger), Tab 3 con GitHub.",
        "VS Code: Abierto en la raíz del proyecto para mostrar la estructura por capas y código clave."
    ]
    for p_text in preps:
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(p_text)
        r.font.size = Pt(9.5)

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    # Función para renderizar cada PASO en paralelo
    def add_paso(numero, seccion, accion_pantalla, locucion):
        # Título del Paso
        p_paso = doc.add_paragraph()
        p_paso.paragraph_format.space_before = Pt(14)
        p_paso.paragraph_format.space_after = Pt(4)
        r_num = p_paso.add_run(f"Paso {numero}: {seccion}")
        r_num.font.size = Pt(12)
        r_num.font.bold = True
        r_num.font.color.rgb = RGBColor(0x92, 0x40, 0x0E)

        # Tabla del Paso (2 filas: Fila 1 = Qué hacer en pantalla, Fila 2 = Qué decir)
        table = doc.add_table(rows=2, cols=1)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        # Fila 1: Acción en Pantalla (Fondo Azul Claro)
        cell_acc = table.rows[0].cells[0]
        cell_acc.width = Inches(6.5)
        set_cell_background(cell_acc, "EFF6FF") # blue-50
        set_cell_margins(cell_acc, top=80, bottom=80, left=120, right=120)

        p_acc = cell_acc.paragraphs[0]
        p_acc.paragraph_format.space_after = Pt(2)
        r_acc_lbl = p_acc.add_run("🖥️ EN PANTALLA (LO QUE HACES): ")
        r_acc_lbl.bold = True
        r_acc_lbl.font.size = Pt(9.5)
        r_acc_lbl.font.color.rgb = RGBColor(0x1D, 0x4E, 0xD8) # blue-700

        r_acc_txt = p_acc.add_run(accion_pantalla)
        r_acc_txt.font.size = Pt(9.5)

        # Fila 2: Locución / Qué Decir (Fondo Ámbar Suave)
        cell_say = table.rows[1].cells[0]
        cell_say.width = Inches(6.5)
        set_cell_background(cell_say, "FEF3C7") # amber-100
        set_cell_margins(cell_say, top=100, bottom=100, left=140, right=140)

        p_say = cell_say.paragraphs[0]
        p_say.paragraph_format.space_after = Pt(2)
        r_say_lbl = p_say.add_run("🎙️ DECIR EN PARALELO (LO QUE DICES):")
        r_say_lbl.bold = True
        r_say_lbl.font.size = Pt(9.5)
        r_say_lbl.font.color.rgb = RGBColor(0xB4, 0x53, 0x09) # amber-700

        p_say_body = cell_say.add_paragraph()
        p_say_body.paragraph_format.space_after = Pt(0)
        p_say_body.paragraph_format.line_spacing = 1.15
        r_say_txt = p_say_body.add_run(f'"{locucion}"')
        r_say_txt.font.size = Pt(10)
        r_say_txt.font.italic = True

        doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # --- PASOS SECUENCIALES ---

    # PARTE 1: INTRODUCCIÓN Y ARQUITECTURA
    add_paso(
        1,
        "Bienvenida e Introducción Institucional",
        "Mostrá la portada de la aplicación web en el navegador (http://localhost:5173) o la cámara con el título del proyecto.",
        "Buenas tardes a los profesores de la cátedra de Programación IV. Mi nombre es Brian Emanuel Rios y a continuación voy a presentar mi Trabajo Práctico Integrador: Food Store, una plataforma web para pedidos y delivery gastronómico en tiempo real."
    )

    add_paso(
        2,
        "Continuidad con Programación III",
        "En el navegador, mostrá el logo de Food Store y el catálogo inicial.",
        "Para este proyecto tomé como base la experiencia y el catálogo que había desarrollado en Programación III, evolucionando toda la solución hacia una arquitectura moderna, desacoplada y con estrictas reglas de negocio transaccionales."
    )

    add_paso(
        3,
        "Estructura por Capas del Backend en VS Code",
        "Abrí VS Code y desplegá la carpeta 'backend/app'. Mostrá 'core' (database, security, unit_of_work, base_repository) y 'modules' (auth, categorias, pedidos, productos, usuarios).",
        "En el backend implementamos una arquitectura limpia por capas con Python 3.11, FastAPI y SQLModel sobre SQLAlchemy 2: Router, Service, Unit of Work y Repository. La seguridad se basa en tokens JWT firmados almacenados en cookies HttpOnly para prevenir vulnerabilidades XSS."
    )

    add_paso(
        4,
        "Estructura del Frontend en VS Code",
        "En VS Code, desplegá 'frontend/src'. Mostrá 'features' por dominio, 'routes' con ProtectedRoute, 'store' (authStore, cartStore) y 'shared'.",
        "En el frontend desarrollamos una Single Page Application con React 19 y TypeScript estricto sin ningún tipo any, empaquetada con Vite 7 y Tailwind CSS 4. Para el estado del servidor usamos TanStack Query 5, para el estado del cliente Zustand 5 persistente, y para formularios y tablas TanStack Form 1 y TanStack Table 8."
    )

    # PARTE 2: PUESTA EN MARCHA Y SWAGGER
    add_paso(
        5,
        "Carga Semilla Idempotente (Seed)",
        "Cambiá a la Terminal 1 (backend) y ejecutá: python -m app.db.seed. Mostrá en la consola los mensajes de tablas creadas y usuarios admin/cliente listos.",
        "Comenzamos mostrando la inicialización del sistema. En la consola del backend ejecutamos 'python -m app.db.seed'. Este proceso es 100% idempotente: si las tablas o los usuarios ya existen, no duplica registros, asegurando que la base de datos quede lista con un administrador, un cliente y los productos de la tienda."
    )

    add_paso(
        6,
        "Inicio del Backend y Documentación Swagger",
        "En la misma Terminal 1, ejecutá: uvicorn app.main:app --reload --port 8000. Luego cambiá al navegador a http://localhost:8000/docs y desplazate por los routers.",
        "Iniciamos FastAPI con Uvicorn en el puerto 8000. En el navegador vemos la documentación interactiva en Swagger UI, donde se encuentran todos los endpoints modulares: autenticación, catálogo, pedidos y panel de administración."
    )

    add_paso(
        7,
        "Verificación de Tipos Estrictos y Arranque del Frontend",
        "Cambiá a la Terminal 2 (frontend) y ejecutá: pnpm build. Mostrá que finaliza con código 0 sin errores de TypeScript. Luego ejecutá: pnpm dev.",
        "En la terminal del frontend corremos 'pnpm build', que ejecuta el compilador estricto de TypeScript. Como pueden comprobar, la compilación de producción termina con código de salida 0 y cero errores de tipos. Ahora iniciamos el servidor de desarrollo de Vite con 'pnpm dev'."
    )

    # PARTE 3: EXPERIENCIA DEL CLIENTE Y REGLAS DE NEGOCIO
    add_paso(
        8,
        "Pantalla de Login y Credenciales Demo",
        "En el navegador andá a http://localhost:5173 y hacé clic en 'Ingresar'. Mostrá el formulario y hacé clic en el botón demo 'Cliente (cliente / Cliente1234!)'.",
        "Ingresamos a la tienda. En la pantalla de login implementamos TanStack Form para validaciones reactivas, y sumamos una idea que tenía en Prog 3: botones de credenciales rápidas. Hacemos clic en 'Cliente' y los campos se autorrellenan al instante."
    )

    add_paso(
        9,
        "Inicio de Sesión y Toast de Bienvenida",
        "Hacé clic en el botón 'Iniciar Sesión'. Mostrá el Toast flotante verde arriba a la derecha y el Navbar con el nombre del cliente.",
        "Iniciamos sesión. El backend responde con la cookie HttpOnly que contiene el token JWT y el sistema nos da la bienvenida con un cartel Toast flotante."
    )

    add_paso(
        10,
        "Búsqueda, Filtro y Paginación en Servidor",
        "En el Catálogo escribí 'Burger' en el buscador y borralo. Hacé clic en la píldora 'Pizzas' y luego en 'Todas'. Mostrá los números de página al pie.",
        "En el catálogo consumimos la API mediante TanStack Query con paginación server-side por skip y limit. Probamos el buscador de texto en tiempo real y los filtros por categoría."
    )

    add_paso(
        11,
        "Agregar al Carrito y Mini Carrito Deslizable (Drawer)",
        "Hacé clic en 'Agregar' en una hamburguesa y una pizza. Se abre el panel deslizante lateral derecho. Presioná el botón '+' para aumentar unidades y '-' para bajar.",
        "Al agregar un plato se despliega el Mini Carrito Deslizable, manteniendo el formato Single Page sin perder de vista el menú. Desde aquí podemos ajustar unidades en vivo respetando el stock disponible del local o saltar directo al checkout."
    )

    add_paso(
        12,
        "Pantalla de Checkout y Validación de Dirección (RN-06)",
        "En el drawer hacé clic en 'Pedir ahora' para ir a /checkout. Dejá la dirección vacía o escribí 'Av' (2 letras) y hacé clic en Confirmar. Mostrá el mensaje rojo de error.",
        "Avanzamos al Checkout. Si la dirección de entrega tiene menos de 5 caracteres, TanStack Form bloquea el envío de forma inmediata, validando la regla de negocio RN-06 para garantizar la correcta logística."
    )

    add_paso(
        13,
        "Confirmación de Pedido y Transaccionalidad (RN-01)",
        "Escribí una dirección válida (ej: 'Av. San Martín 1234, Dpto 2B'), elegí la tarjeta de pago 'Efectivo', escribí en notas 'Tocar timbre 2B' y hacé clic en 'Confirmar y Realizar Pedido'.",
        "Ingresamos una dirección válida, seleccionamos pago en Efectivo y confirmamos. El backend procesa la orden de forma transaccional con Unit of Work según la regla RN-01: descuenta el stock atómicamente, vacía el carrito y nos redirige a Mis Pedidos."
    )

    add_paso(
        14,
        "Mis Pedidos e Inmutabilidad de Líneas (RN-02)",
        "En /mis-pedidos, mostrá la orden creada con badge 'PENDIENTE'. Hacé clic en 'Ver detalle' para desplegar los artículos ordenados.",
        "Llegamos a 'Mis Pedidos'. Al desplegar la orden comprobamos la regla RN-02: cada ítem conserva su precio unitario y nombre histórico inmutable, protegiendo el comprobante del cliente ante futuros aumentos en el catálogo."
    )

    add_paso(
        15,
        "Cancelación de Pedido y Devolución de Stock (RN-05)",
        "Hacé clic en el botón rojo 'Cancelar Pedido'. Se abre el modal de confirmación. Hacé clic en 'Sí, cancelar pedido'. Mostrá que el badge cambia a 'CANCELADO' y salta el Toast.",
        "Cumpliendo la regla RN-05, como el pedido está en estado PENDIENTE, la cancelación está permitida. Confirmamos en el modal, la orden pasa a CANCELADO y el backend reintegra automáticamente las cantidades al stock de la tienda."
    )

    # PARTE 4: PANEL DE ADMINISTRACIÓN Y MÁQUINA DE ESTADOS
    add_paso(
        16,
        "Cierre de Sesión y Login como Administrador",
        "En el Navbar hacé clic en el botón de Logout. Andá a /login, hacé clic en el botón demo 'Admin (admin / Admin1234!)' e ingresá.",
        "Cerramos la sesión del cliente y ahora ingresamos con la cuenta de Administrador. El guardián de rutas detecta el rol 'admin' y nos dirige automáticamente al Panel de Control."
    )

    add_paso(
        17,
        "Pestaña Resumen y Métricas en Tiempo Real",
        "Mostrá la pantalla /admin/resumen con las 6 tarjetas de métricas (Ingresos entregados, pedidos de hoy, en preparación, pendientes, entregados, cancelados).",
        "En la pestaña 'Resumen' el administrador visualiza los indicadores del negocio en tiempo real: facturación total de órdenes entregadas, volumen de pedidos del día y estado de cocina."
    )

    add_paso(
        18,
        "Gestión de Pedidos y Máquina de Estados (RN-03)",
        "Hacé clic en la pestaña 'Pedidos' (/admin/pedidos). Ubicá una orden PENDIENTE y hacé clic en 'Preparar' (pasa a EN_PREPARACION). Luego en esa misma orden hacé clic en 'Marcar Entregado' (pasa a ENTREGADO).",
        "Pasamos a 'Pedidos'. Aquí opera la regla RN-03 con la máquina de estados: una orden PENDIENTE solo puede pasar a EN_PREPARACION o cancelarse. Al estar en cocina, la marcamos como ENTREGADO. Una vez entregada o cancelada, entra en un estado final que no admite modificaciones."
    )

    add_paso(
        19,
        "ABM de Categorías con TanStack Table y TanStack Form",
        "Hacé clic en 'Categorías' (/admin/categorias). Escribí en el buscador de la tabla para filtrar. Hacé clic en 'Nueva Categoría', completá nombre 'Postres Caseros' y guardá.",
        "En 'Categorías' implementamos TanStack Table para ordenamiento y filtrado en el cliente. Abrimos el modal con TanStack Form, damos de alta una categoría y vemos cómo se actualiza la tabla reactivamente."
    )

    add_paso(
        20,
        "ABM de Productos, Edición Rápida de Stock y Disponibilidad",
        "Hacé clic en 'Productos' (/admin/productos). En un plato, presioná los botones '+' y '-' de la columna de Stock. Luego hacé clic en el badge 'Disponible' para pausarlo.",
        "En 'Productos' gestionamos los platos. Observen esta función clave: la edición rápida de stock inline. Con los botones más y menos modificamos el inventario en un clic vía PATCH sin abrir formularios, y con el switch pausamos la disponibilidad del plato para que no figure en el menú."
    )

    add_paso(
        21,
        "Gestión de Usuarios y Regla de Seguridad",
        "Hacé clic en 'Usuarios' (/admin/usuarios). Mostrá la tabla y señalá que en tu fila de 'admin' el botón dice 'Protegido' (deshabilitado). Luego desactivá y activá al usuario 'cliente'.",
        "En 'Usuarios' controlamos el acceso. Noten la regla de seguridad: el sistema bloquea el botón de auto-desactivación para el administrador que tiene la sesión iniciada, evitando que el panel quede inaccesible por error."
    )

    # PARTE 5: CÓDIGO FUENTE, EMPAQUETADO Y CIERRE
    add_paso(
        22,
        "Revisión de Código: Unit of Work y Seguridad de Sesión",
        "En VS Code abrí 'backend/app/core/unit_of_work.py' y mostrá los métodos __enter__ y __exit__. Luego abrí 'frontend/src/store/authStore.ts' y mostrá 'partialize'.",
        "Para cerrar, repasamos dos puntos clave del código: en 'unit_of_work.py' implementamos el context manager transaccional con commit y rollback automático ante cualquier error. Y en el frontend, 'authStore.ts' utiliza partialize guardando únicamente el perfil; los tokens jamás tocan localStorage y viajan seguros en la cookie HttpOnly."
    )

    add_paso(
        23,
        "Empaquetado de Entrega (.zip) y Repositorio GitHub",
        "En la terminal raíz ejecutá: powershell -ExecutionPolicy Bypass -File scripts/empaquetar_entrega.ps1. Mostrá el ZIP de 0.88 MB generado. Luego mostrá en Chrome el repo con los 11 issues cerrados.",
        "Finalmente, ejecutamos el script de empaquetado que genera el archivo 'TPI-Food_Store-Brian_Emanuel_Rios.zip' de menos de 1 MB, excluyendo node_modules, entornos virtuales y secretos locales, cumpliendo las pautas CE-01 a CE-07. Con todos los commits y los 11 issues cerrados en GitHub, concluyo mi presentación. Muchas gracias."
    )

    # Guardar documento
    doc.save(output_path)
    print(f"Documento secuencial guardado exitosamente en: {output_path}")

if __name__ == "__main__":
    out = os.path.abspath("Guion_Video_Demostrativo_FoodStore.docx")
    create_guion_secuencial_docx(out)
