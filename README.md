# SOLMAR - Portal de Recursos Humanos y Comunicación Interna

Plataforma web desarrollada para la gestión de comunicación interna, cartelera de novedades, repositorio de documentos oficiales y seguimiento de festejos corporativos de **Óptica SOLMAR**.

---

## 🚀 Tecnologías Utilizadas

- **Frontend:** React 18, TypeScript, Vite
- **Estilos:** Tailwind CSS
- **Base de Datos & Backend:** Firebase Firestore (sincronización en tiempo real)
- **Iconografía:** Lucide React
- **Empaquetado & Build:** Vite

---

## 📦 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js** (versión 18 o superior recomendada)
- **npm** o **yarn**

### Pasos de Instalación

1. **Clonar o descargar el proyecto:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd solmar-portal-rrhh
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000` (o el puerto configurado por Vite).

4. **Compilar para producción:**
   ```bash
   npm run build
   ```
   Esto generará los archivos estáticos optimizados en la carpeta `dist/`, listos para ser desplegados en plataformas como Vercel, Netlify o Firebase Hosting.

---

## 📁 Estructura del Proyecto

```text
├── public/                  # Recursos estáticos públicos (logos, favicon)
├── src/
│   ├── components/          # Componentes de interfaz de usuario
│   │   ├── modals/          # Modales para creación y edición de contenido
│   │   ├── AdminDashboard.tsx   # Panel de control de RRHH
│   │   ├── AnnouncementFeed.tsx # Cartelera de novedades y comunicados
│   │   ├── CelebrationsView.tsx # Vista de cumpleaños y aniversarios
│   │   ├── DocumentsView.tsx    # Repositorio y visualizador de documentos PDF
│   │   ├── Navbar.tsx           # Barra superior con buscador y notificaciones
│   │   ├── Navigation.tsx       # Barra de navegación lateral y móvil
│   │   └── NotificationsPopover.tsx # Menú flotante de notificaciones
│   ├── data/                # Datos de configuración (tokens por área)
│   ├── hooks/               # Custom hooks de React (useHRData)
│   ├── services/            # Servicios de conexión y consultas a Firebase Firestore
│   ├── types.ts             # Definiciones de tipos e interfaces en TypeScript
│   ├── App.tsx              # Componente raíz de la aplicación
│   ├── firebase.ts          # Inicialización y configuración de Firebase
│   ├── main.tsx             # Punto de entrada de React
│   └── index.css            # Configuración global de estilos con Tailwind
├── firestore.rules          # Reglas de seguridad para Firestore
├── package.json             # Dependencias y scripts del proyecto
└── vite.config.ts           # Configuración del empaquetador Vite
```

---

## ✨ Funcionalidades Principales

### 1. 📰 Cartelera de Novedades y Comunicados
- Publicación de anuncios oficiales categorizados (*General, Políticas, Eventos, Urgente*).
- Fijado de comunicados prioritarios en la parte superior.
- Interacción con "Me Gusta" y sección de comentarios en tiempo real con identificación por área.

### 2. 📄 Repositorio de Documentos Corporativos
- Carga de reglamentos, manuales y formularios en formato PDF o Word.
- Vista previa embebida, contador de descargas y descarga directa de archivos.
- Búsqueda y filtrado por categoría (*Reglamentos, Políticas, Formularios, Guías, General*).

### 3. 🎂 Festejos y Reconocimientos
- Calendario y tarjetas de cumpleaños y aniversarios laborales del personal.
- Filtros por tipo de festejo y botón interactivo para enviar saludos a compañeros.

### 4. 🔑 Panel de Control y Gestión de RRHH
- Autenticación administrativa directa mediante contraseña de acceso.
- Configuración institucional de la empresa (nombre, eslogan, datos de contacto de RRHH).
- Gestión centralizada de comunicados, documentos y festejos con acciones rápidas de publicación y moderación.

---

## 📄 Licencia

Este proyecto es de uso interno exclusivo para **Óptica SOLMAR**.
