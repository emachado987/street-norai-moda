# Street NØRAI: puesta en producción segura y transparencia de IA

## Acciones obligatorias antes de desplegar

1. Revocar y regenerar la contraseña editorial y cualquier clave de Gemini/OpenAI que haya estado en el navegador o en el historial del repositorio.
2. Crear o confirmar la cuenta editorial en Firebase Authentication y verificar su correo.
3. Con credenciales de administrador de Firebase disponibles localmente, ejecutar:

   ```bash
   cd functions
   npm run set-admin -- correo-editorial@ejemplo.com
   ```

4. Cerrar sesión y volver a entrar para que Firebase emita un token con el permiso `admin`.
5. Guardar `GEMINI_API_KEY` como secreto de Firebase Functions. Las claves de proveedor no deben usar prefijo `VITE_`, incluirse en el frontend ni guardarse en `localStorage`.

## Orden recomendado de despliegue

1. Rotar credenciales y asignar el permiso `admin`.
2. Desplegar la función protegida y comprobar el inicio de sesión.
3. Desplegar `firestore.rules` y `storage.rules`.
4. Desplegar Firebase Hosting con las cabeceras de seguridad.

Comandos orientativos:

```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase deploy --only functions:api
firebase deploy --only firestore:rules,storage
firebase deploy --only hosting
```

## Medidas aplicadas

- Firebase Auth y claim `admin` para generar, guardar y eliminar.
- Rate limit: 5 generaciones por cuenta cada 10 minutos.
- Validación doble, en navegador y servidor: JPG/PNG/WEBP, máximo 10 MB por imagen y prompt máximo de 1.000 caracteres.
- CORS limitado a los dominios de Street NØRAI y desarrollo local.
- Claves de Gemini/OpenAI únicamente en el servidor.
- Escrituras de Firestore y Storage restringidas a administradores.
- Etiqueta visible y marca en la imagen para indicar que el contenido ha sido generado con IA.
- Cabeceras CSP, HSTS, `nosniff`, política de referentes y restricciones de permisos.
- Runtime Node.js 22 y Firebase Admin actualizados para mantener soporte de seguridad vigente.

## Revisión ACTA de IA

La interfaz informa antes de generar y en cada resultado/archivo de que la imagen es sintética. Antes de publicar, una persona debe revisar derechos sobre las imágenes de entrada, consentimiento de personas identificables, marcas, exactitud y posibles contenidos engañosos.

La marca visual es una primera medida de transparencia. Si el proveedor devuelve metadatos de procedencia, deben conservarse. Para publicaciones externas de alto alcance, conviene incorporar además credenciales de contenido verificables (por ejemplo, C2PA) para reforzar el marcado legible por máquinas.

## Pruebas mínimas tras desplegar

- Visitante: puede leer el lookbook, pero no generar, escribir ni eliminar.
- Usuario autenticado sin `admin`: recibe acceso denegado.
- Administrador: puede generar y guardar; la sexta petición dentro de 10 minutos recibe HTTP 429.
- Archivo no imagen, imagen mayor de 10 MB o prompt mayor de 1.000 caracteres: se rechaza.
- Petición desde un origen no autorizado: se rechaza.
- El resultado y el lookbook muestran “Generado con IA”.
