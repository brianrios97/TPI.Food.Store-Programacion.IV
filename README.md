# Food Store - Sistema de Pedidos y Delivery Gastronómico

Trabajo Práctico Integrador (TPI) para la materia **Programación IV**  
**Tecnicatura Universitaria en Programación de Sistemas - Universidad Tecnológica Nacional (UTN)**  
**Autor:** Brian Emanuel Rios  
**Repositorio GitHub:** [https://github.com/brianrios97/TPI.Food.Store-Programacion.IV](https://github.com/brianrios97/TPI.Food.Store-Programacion.IV)  
**Video Demostrativo:** [Enlace a YouTube (Demostración de la Aplicación)](https://youtu.be/TU_VIDEO_AQUI) *(reemplazar por el link del video grabado)*

---

## 🍽️ Descripción del Proyecto

**Food Store** es una plataforma web completa de pedidos de comida y delivery en tiempo real. Evoluciona la experiencia y catálogo del proyecto desarrollado en *Programación III*, migrándola hacia una arquitectura empresarial desacoplada en capas: un backend de alto rendimiento con **FastAPI** y **SQLModel**, autenticación segura con JWT en **cookies HttpOnly**, y una Single Page Application (SPA) reactiva y moderna construida con **React 19**, **TypeScript** estricto, **Vite 7**, **Tailwind CSS 4**, **TanStack Query 5**, **Zustand 5**, **TanStack Form 1** y **TanStack Table 8**.

---

## 🚀 Tecnologías Utilizadas

### Backend
- **Python 3.11+**
- **FastAPI (v0.115+)**: Framework web moderno, asíncrono y de tipado estricto.
- **SQLModel (SQLAlchemy 2 + Pydantic v2)**: ORM unificado con modelos de dominio y esquemas de validación.
- **SQLite / PostgreSQL**: Soporte dual out-of-the-box para desarrollo y producción.
- **Python-JOSE & Passlib[bcrypt]**: Cifrado seguro de contraseñas con bcrypt y generación de tokens JWT firmados almacenados en cookies `HttpOnly` (seguras contra ataques XSS).
- **Arquitectura en Capas:** Router &rarr; Service &rarr; Unit of Work &rarr; Repository &rarr; Model.

### Frontend
- **React 19** en modo estricto (`strict: true`, 0 `any` en todo el codebase).
- **TypeScript 5.9**: Tipado estricto de extremo a extremo.
- **Vite 7**: Empaquetador y entorno de desarrollo ultra veloz.
- **Tailwind CSS 4** (`@tailwindcss/vite`): Estilos modernos y diseño responsivo.
- **TanStack Query 5**: Gestión de estado del servidor, caché inteligente y revalidación en segundo plano.
- **Zustand 5 con `persist`**: Gestión de estado del cliente (sesión y carrito persistente con `partialize`).
- **TanStack Form 1**: Formularios declarativos y validaciones reactivas en tiempo real.
- **TanStack Table 8**: Tablas interactivas headless con ordenamiento, filtrado y paginación.
- **React Router 7**: Enrutamiento declarativo para SPA y componentes guardianes de roles (`<ProtectedRoute />`).
- **Lucide React**: Iconografía moderna y minimalista.

---

## 📋 Reglas de Negocio Implementadas (RN-01 a RN-06)

1. **RN-01 (Transaccionalidad):** La creación de pedidos es una operación atómica dentro de un contexto de *Unit of Work*. Se valida la existencia y disponibilidad de stock de todos los ítems antes de persistir; si algún ítem no tiene stock suficiente, se aborta la transacción con rollback.
2. **RN-02 (Inmutabilidad de Líneas de Pedido):** Cada detalle del pedido (`DetallePedido`) guarda una copia histórica del `nombre_producto` y `precio_unitario` al momento de la compra. Futuras modificaciones de precio o bajas en el catálogo no afectan los pedidos ya registrados.
3. **RN-03 (Máquina de Estados de 4 Estados):**
   - Transiciones permitidas:
     - `PENDIENTE` &rarr; `EN_PREPARACION` o `CANCELADO`.
     - `EN_PREPARACION` &rarr; `ENTREGADO`.
     - `ENTREGADO` y `CANCELADO` son estados finales no modificables.
   - Cualquier intento de salto inválido (por ejemplo, de `PENDIENTE` a `ENTREGADO`) es rechazado con error HTTP 400.
4. **RN-04 (Control de Acceso y Propiedad):**
   - Los clientes solo pueden consultar y cancelar sus propios pedidos.
   - Los administradores tienen acceso global a todos los pedidos y paneles operativos.
5. **RN-05 (Cancelación y Restitución de Stock):**
   - Un pedido solo puede cancelarse si se encuentra en estado `PENDIENTE`.
   - Al cancelarse, las cantidades de los productos asociados se reintegran automáticamente al stock disponible en la base de datos.
6. **RN-06 (Validación de Dirección de Entrega):**
   - La dirección de entrega es obligatoria y debe tener entre 5 y 200 caracteres para asegurar la correcta logística del delivery.

---

## 🌟 Detalles de Experiencia de Usuario (Inspirados en Prog III)

- **Mini Carrito Deslizable (`CartDrawer`):** Al tocar el ícono de compra en la barra de navegación, se despliega un panel lateral derecho deslizante para sumar/restar cantidades y ver el subtotal sin salir de la pantalla de compra.
- **Sistema de Notificaciones Toast:** Carteles flotantes automáticos en la esquina superior derecha (`toast.success`, `toast.error`, `toast.info`).
- **Credenciales Rápidas en Login:** Recuadro interactivo en la pantalla de inicio de sesión con botones para cargar las credenciales de `admin` o `cliente` con un solo clic.
- **Modales de Confirmación:** Diálogos estilizados para confirmar vaciado de carrito y cancelaciones de órdenes.

---

## ⚙️ Instalación y Puesta en Marcha

### Prerrequisitos
- **Python 3.11** o superior instalado.
- **Node.js 20** o superior y gestor de paquetes **pnpm** (o npm / yarn).

---

### Paso 1: Configurar y Ejecutar el Backend

1. Abrir una terminal y posicionarse en la carpeta `backend`:
   ```bash
   cd backend
   ```

2. Crear y activar un entorno virtual:
   - **En Windows:**
     ```powershell
     python -m venv .venv
     .venv\Scripts\activate
     ```
   - **En Linux / macOS:**
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Instalar las dependencias fijadas:
   ```bash
   pip install -r requirements.txt
   ```

4. Configurar las variables de entorno:
   - Copiar el archivo de ejemplo:
     - En Windows (PowerShell): `Copy-Item .env.example .env`
     - En Linux/Mac: `cp .env.example .env`

5. Ejecutar la carga de datos semilla (idempotente):
   ```bash
   python -m app.db.seed
   ```
   *(Crea las tablas, el usuario admin, cliente, 5 categorías y 19 productos reciclados de Prog 3).*

6. Iniciar el servidor FastAPI con recarga en vivo:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - **API REST disponible en:** `http://localhost:8000`
   - **Documentación Swagger interactiva:** `http://localhost:8000/docs`
   - **Documentación ReDoc:** `http://localhost:8000/redoc`

---

### Paso 2: Configurar y Ejecutar el Frontend

1. Abrir otra terminal y posicionarse en la carpeta `frontend`:
   ```bash
   cd frontend
   ```

2. Instalar las dependencias con **pnpm**:
   ```bash
   pnpm install
   ```

3. Configurar las variables de entorno del frontend:
   - Copiar el archivo de ejemplo:
     - En Windows (PowerShell): `Copy-Item .env.example .env`
     - En Linux/Mac: `cp .env.example .env`

4. Iniciar el servidor de desarrollo Vite:
   ```bash
   pnpm dev
   ```

5. Abrir el navegador en:
   ```text
   http://localhost:5173
   ```

---

## 🔑 Credenciales de Prueba Preconfiguradas (Seed)

| Rol | Usuario | Contraseña | Permisos y Alcance |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin` | `Admin1234!` | Acceso al Panel de Administración (`/admin/resumen`), métricas en tiempo real, ABM de categorías, ABM de productos con control de stock, gestión y avance de pedidos de la tienda, activación y desactivación de usuarios. |
| **Cliente** | `cliente` | `Cliente1234!` | Navegación del catálogo con filtros y búsqueda, agregar ítems al carrito, checkout con selección de pago y seguimiento de pedidos propios en `/mis-pedidos`. |

---

## 📦 Empaquetado para Entrega (Criterios CE-01 a CE-07)

Para generar el archivo ZIP limpio para la entrega académica sin carpetas pesadas ni secretos (`node_modules`, `.venv`, `.env`, bases de datos locales, caché):

Ejecutar desde la raíz del proyecto en PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/empaquetar_entrega.ps1
```

Este script genera en la raíz el archivo:
```text
TPI-Food_Store-Brian_Emanuel_Rios.zip
```
Listo para ser subido al campus virtual.

---

## 🏛️ Estructura del Proyecto

```text
TPI-Food_Store/
├── backend/
│   ├── app/
│   │   ├── core/           # Configuración, Base de Datos, Seguridad JWT, Dependencias, BaseRepository, UnitOfWork
│   │   ├── db/             # Script de carga inicial idempotente (seed.py)
│   │   ├── modules/
│   │   │   ├── auth/       # Servicio y Router de Autenticación (Login, Logout, Me)
│   │   │   ├── categorias/ # Modelo, Esquemas, Repositorio, Servicio y Router
│   │   │   ├── pedidos/    # Modelo, Esquemas, Repositorio, Servicio transaccional y Router
│   │   │   ├── productos/  # Modelo, Esquemas, Repositorio, Servicio y Router
│   │   │   └── usuarios/   # Modelo, Esquemas, Repositorio, Servicio y Router de Admin
│   │   └── main.py         # Punto de entrada de FastAPI y configuración de CORS
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── features/       # Módulos por dominio: auth, categorias, pedidos, productos, usuarios
│   │   ├── routes/         # AppRouter y ProtectedRoute por roles
│   │   ├── shared/         # Axios singleton, componentes UI reutilizables, layout y navegación
│   │   ├── store/          # Stores Zustand (authStore con HttpOnly checkSession, cartStore persistente, toastStore)
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css       # Tailwind CSS 4
│   ├── .env.example
│   ├── package.json
│   ├── pnpm-lock.yaml
│   ├── tsconfig.json
│   └── vite.config.ts
├── scripts/
│   └── empaquetar_entrega.ps1
├── .gitignore
└── README.md
```

---

© 2026 **Food Store** - Trabajo Práctico Integrador de Programación IV (UTN). Desarrollado por **Brian Emanuel Rios**.
