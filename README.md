# Thinking Backend (MVP)

Este es el backend del proyecto **Thinking**. Se encarga de recibir archivos
educativos subidos por los profesores, analizarlos con IA, y generar
materiales adaptados a los estilos de aprendizaje (Visual, Auditivo, Kinestésico).

**Importante:** este proyecto es independiente del repositorio principal
`Thinking` (el que está en GitHub Pages). GitHub Pages no puede ejecutar
código de servidor, por eso este backend vive en un repositorio aparte y se
despliega en un servicio distinto (ver sección "Despliegue" más abajo).

## Estado actual (MVP)

Por ahora este MVP solo soporta:
- Formato de entrada: **PDF**
- Estilo de salida: **Visual**
- Formato de salida: **PDF**

Los demás formatos (DOCX, PPTX, imágenes) y estilos (Auditivo, Kinestésico)
se agregan después, siguiendo el mismo patrón ya armado aquí.

## Estructura del proyecto

```
Thinking-Backend/
├── src/
│   ├── index.js                     → Enciende el servidor
│   ├── routes/                      → Las "puertas de entrada" de la API
│   │   ├── upload.js                → Recibe el archivo del profesor
│   │   ├── analyze.js               → Analiza el documento con IA
│   │   └── generate.js              → Genera el material final
│   ├── services/
│   │   ├── extraction/pdf.js        → Lee el texto de un PDF
│   │   ├── ai/analyzeDocument.js     → Le pregunta a la IA qué dice el documento
│   │   ├── ai/generateByStyle.js     → Le pide a la IA el contenido por estilo
│   │   ├── render/toPDF.js          → Convierte el contenido en PDF
│   │   └── storage/supabaseStorage.js → Sube los archivos a Supabase Storage
│   └── db/supabaseClient.js         → Conexión a la base de datos
└── templates/visual/resumen.html    → Diseño del PDF del estilo Visual
```

## Instalación (paso a paso, para correrlo en tu computadora)

1. Instala [Node.js](https://nodejs.org/) si no lo tienes (versión 18 o superior).
2. Abre una terminal dentro de esta carpeta y ejecuta:
   ```
   npm install
   ```
3. Copia el archivo `.env.example` y renómbralo a `.env`
4. Llena `.env` con tus datos reales:
   - `SUPABASE_URL`: la misma que ya usas en el frontend
   - `SUPABASE_SERVICE_ROLE_KEY`: la encuentras en Supabase → Project Settings → API → "service_role" (¡esta clave es secreta, nunca la compartas ni la subas a GitHub!)
   - `ANTHROPIC_API_KEY`: tu clave de la API de Claude (Anthropic)
5. Enciende el servidor:
   ```
   npm start
   ```
6. Deberías ver en la terminal: `Servidor escuchando en el puerto 3000`

## Tablas necesarias en Supabase

Antes de usar este backend, crea estas dos tablas en tu proyecto de Supabase
(Table Editor → New Table):

**`material_jobs`**
| Columna | Tipo |
|---|---|
| id | uuid (primary key, default: gen_random_uuid()) |
| teacher_id | uuid |
| nombre_archivo_original | text |
| estado | text |
| tema_detectado | text |
| analisis_json | jsonb |
| created_at | timestamp (default: now()) |

**`generated_materials`**
| Columna | Tipo |
|---|---|
| id | uuid (primary key, default: gen_random_uuid()) |
| job_id | uuid |
| estilo | text |
| tipo_archivo | text |
| url_archivo | text |
| created_at | timestamp (default: now()) |

También crea un bucket de Storage llamado `materiales-generados`
(Storage → New bucket → nombre exacto: `materiales-generados`, privado).

## Despliegue (cómo se pone en funcionamiento, no solo en tu computadora)

Este MVP usa Puppeteer, que necesita un poco más de recursos que una Edge
Function típica. Para este primer MVP recomendamos desplegarlo en un
servicio como **Render.com**, siguiendo estos pasos generales:

1. Sube este proyecto a un repositorio de GitHub (ej. `Thinking-Backend`).
2. Crea una cuenta en [Render.com](https://render.com/).
3. Crea un "New Web Service" y conéctalo a tu repositorio.
4. Configura las variables de entorno (las mismas del `.env`) en el panel de Render.
5. Render te dará una URL pública, por ejemplo:
   `https://thinking-backend.onrender.com`
6. Esa URL es la que usarás desde `Create-Material.js` en el frontend para
   hacer las peticiones (`/api/upload`, `/api/analyze`, `/api/generate`).

## Endpoints disponibles (MVP)

| Método | Ruta | Qué hace |
|---|---|---|
| POST | `/api/upload` | Recibe el archivo PDF y crea el trabajo |
| POST | `/api/analyze/:job_id` | Analiza el documento con IA |
| POST | `/api/generate/:job_id` | Genera el material del estilo Visual en PDF |
