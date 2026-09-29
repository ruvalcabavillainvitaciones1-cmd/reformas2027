# Registro Reformas Fiscales 2027: guía de instalación

Esta carpeta trae todo lo necesario para el registro de la conferencia del **jueves 3 de diciembre de 2026** en el Hotel RIU, Guadalajara.

## Qué hay en la carpeta

- **sitio/**: las páginas web. Esto es lo que se sube a GitHub.
  - `index.html`: la página pública. El invitado escribe su correo, confirma y recibe su pase con QR. Si no está en la lista, puede pedir lugar en la lista de espera.
  - `recepcion.html`: la pantalla del staff para escanear los QR en la entrada. Pide usuario y contraseña.
  - `admin.html`: tu panel. Cargas la lista de invitados, ves quién confirmó y quién llegó, aceptas a la lista de espera y descargas el Excel final.
  - `config.js`: **el único archivo que editas**. Lleva la configuración de Firebase y los datos del evento.
  - `comun.js`, `sw.js` y `assets/`: no se tocan.
- **reglas-firebase.json**: las reglas de seguridad que se pegan en Firebase.
- **plantilla-invitados.xlsx**: el formato para armar la lista de invitados.

Mientras `config.js` diga `PEGA_AQUI`, las páginas funcionan en **modo de prueba** con datos de ejemplo y no guardan nada. Así puedes revisarlas antes de conectar Firebase.

---

## Paso 1. Crear el proyecto en Firebase

1. Entra a <https://console.firebase.google.com> con la cuenta de Google que usaste para la quiniela.
2. Da clic en **Crear un proyecto** (o **Agregar proyecto**).
3. Nombre: `rv-reformas-2027`. Continuar.
4. Cuando pregunte por Google Analytics, **desactívalo** (no hace falta). Crear proyecto.

Es un proyecto nuevo y separado de la quiniela a propósito: aquí hay datos de clientes y, cuando termine el evento, lo puedes archivar o borrar sin tocar nada más.

## Paso 2. Crear la base de datos y pegar las reglas

1. En el menú de la izquierda: **Compilación → Realtime Database → Crear una base de datos**.
2. Ubicación: **Estados Unidos (us-central1)**. Siguiente.
3. Elige **Comenzar en modo bloqueado**. Habilitar.
4. Arriba, entra a la pestaña **Reglas**.
5. Borra todo lo que aparece, abre `reglas-firebase.json` con el Bloc de notas, copia todo su contenido, pégalo y da clic en **Publicar**.

Importante: estas reglas **no se abren** aunque algo no funcione. Si algo falla, avísame y lo revisamos, pero no las cambies a modo de prueba, porque dejarían la lista de clientes a la vista.

## Paso 3. Activar el inicio de sesión y crear las cuentas

1. Menú izquierdo: **Compilación → Authentication → Comenzar**.
2. En **Método de acceso**, elige **Correo electrónico/contraseña**, activa el primer interruptor y **Guardar**.
3. En la pestaña **Configuración**, busca **Acciones del usuario** y desactiva la opción que permite crear cuentas (registro). Así nadie puede crearse una cuenta por su cuenta; solo tú las das de alta.
4. En la pestaña **Usuarios**, da clic en **Agregar usuario** y crea:
   - Tu cuenta de administrador.
   - Una cuenta por cada persona que va a escanear en la entrada (por ejemplo, 3 o 4).
5. Anota las contraseñas en un lugar seguro. Para cambiar una después, borras el usuario y lo vuelves a crear.

## Paso 4. Dar permisos (admin y recepción)

Cada usuario tiene un código llamado **UID**, que aparece en la tabla de **Authentication → Usuarios** (columna "UID de usuario", con un botón para copiarlo).

1. Ve a **Realtime Database → pestaña Datos**.
2. Pasa el mouse sobre la línea de arriba (la dirección de tu base) y da clic en el **+**.
3. En **Clave** escribe `staff` y, sin poner valor, da clic otra vez en el **+** que aparece junto a `staff`.
4. En la nueva fila: en **Clave** pega el UID de tu cuenta y en **Valor** escribe `admin`.
5. Repite el **+** junto a `staff` para cada persona de recepción: su UID como clave y `recepcion` como valor.
6. Da clic en **Agregar**.

Debe quedar así:

```
staff
  ├─ AbC123...tu UID... : "admin"
  ├─ XyZ789...UID...    : "recepcion"
  └─ ...
```

Si a alguien se le olvida este paso, la página de recepción le muestra su UID con un botón para copiarlo y mandártelo.

## Paso 5. Conectar las páginas con Firebase (config.js)

1. En Firebase, da clic en el **engrane** (arriba a la izquierda) → **Configuración del proyecto**.
2. Abajo, en **Tus apps**, da clic en el ícono **`</>`** (Web).
3. Apodo: `registro`. **No** marques Firebase Hosting. Registrar app.
4. Aparece un bloque de código con `const firebaseConfig = { ... }`. Copia cada valor (lo que va entre comillas) y pégalo en el lugar correspondiente de `sitio/config.js`, en lugar de cada `PEGA_AQUI`. Abre `config.js` con el Bloc de notas.
5. Si en ese bloque no aparece `databaseURL`, cópiala de **Realtime Database → Datos**: es la dirección que aparece arriba de los datos y termina en `firebaseio.com`.
6. En el mismo archivo, llena `contacto` (el correo para dudas y cancelaciones) y `avisoPrivacidad` (el enlace al aviso de privacidad del despacho). Si los dejas vacíos, simplemente no se muestran.
7. Guarda el archivo.

Estos datos de configuración son públicos por diseño; lo que protege la información son las reglas del paso 2.

## Paso 6. Publicar en GitHub Pages

1. Entra a <https://github.com> con tu cuenta y crea un repositorio nuevo: **New**, nombre `reformas2027`, **Public**, Create repository.
2. Da clic en **uploading an existing file**.
3. Abre la carpeta `sitio` y arrastra **todo lo que tiene adentro** (incluida la carpeta `assets`) a la ventana de GitHub. No arrastres la carpeta `sitio` en sí.
4. Abajo, **Commit changes**.
5. Ve a **Settings → Pages**. En **Source** elige **Deploy from a branch**, rama **main**, carpeta **/ (root)**, y **Save**.
6. Espera uno o dos minutos. Arriba aparecerá la dirección, del tipo `https://TU-USUARIO.github.io/reformas2027/`.
7. De vuelta en Firebase: **Authentication → Configuración → Dominios autorizados → Agregar dominio** y escribe `TU-USUARIO.github.io`.

Tus tres páginas quedan así:

- Registro (va en la invitación): `https://TU-USUARIO.github.io/reformas2027/`
- Recepción: `https://TU-USUARIO.github.io/reformas2027/recepcion.html`
- Panel: `https://TU-USUARIO.github.io/reformas2027/admin.html`

**Nunca subas a GitHub el Excel con la lista de invitados.** El repositorio es público; la lista se carga desde el panel directo a Firebase.

**Opcional, recomendado: dominio propio.** Una dirección como `registro.ruvicia.com` da más confianza a los clientes que una de github.io. En **Settings → Pages → Custom domain** escribe el subdominio; luego, en el administrador del DNS de su dominio, crea un registro **CNAME** llamado `registro` que apunte a `TU-USUARIO.github.io`. Cuando GitHub lo valide, activa **Enforce HTTPS** y agrega también ese dominio en los dominios autorizados de Firebase.

## Paso 7. Cargar la lista de invitados

1. Llena `plantilla-invitados.xlsx`: una fila por invitado con Nombre, Empresa y Correo. El correo debe ser el mismo al que se manda la invitación.
2. Abre el panel (`admin.html`) y entra con tu cuenta de administrador.
3. En **Cargar invitados**, da clic en **Elegir archivo** y selecciona el Excel.
4. Revisa el resumen: cuántos son nuevos, cuántos se actualizan y cuáles tienen datos incompletos.
5. Da clic en **Importar**.

Puedes volver a subir el Excel cuantas veces quieras: si un correo ya estaba, se actualizan su nombre y empresa y conserva su folio. Para una sola persona, usa **Agregar un invitado a mano**.

## Paso 8. Probar antes de mandar las invitaciones

- [ ] Agrégate como invitado desde el panel.
- [ ] En tu celular abre la página de registro, escribe tu correo, confirma y revisa tu pase.
- [ ] En otro celular abre `recepcion.html`, entra con una cuenta de recepción, toca **Iniciar cámara** y escanea tu pase: debe salir en verde **Acceso registrado**.
- [ ] Escanéalo otra vez: debe salir en ámbar **Este pase ya había entrado**.
- [ ] En el panel revisa que los contadores cambiaron. Luego usa **Quitar entrada** para deshacer la prueba.
- [ ] Prueba con un correo que no esté en la lista y pide lugar: debe aparecer en **Lista de espera** del panel.
- [ ] Haz la prueba en un iPhone (Safari) y en un Android (Chrome).
- [ ] Al terminar, elimina tus registros de prueba desde el panel.

---

## El día del evento

- Deja las sesiones de recepción abiertas desde antes y con permiso de cámara ya dado. Lleva los celulares cargados y con batería externa.
- Pide al hotel una red Wi-Fi para el staff o usa un celular como punto de acceso. Si se cae la señal, la recepción sigue funcionando y envía las entradas cuando regresa: **no recargues la página mientras no haya señal**.
- Si a alguien no le abre su pase, búscalo por nombre, empresa o folio y toca **Registrar entrada**.
- El panel muestra en vivo cuántos han llegado; puedes tenerlo abierto en una laptop.
- Después de las 19:30 h la página de registro muestra que el registro ya cerró.

## Después del evento

1. En el panel, da clic en **Descargar Excel de asistencia**. Trae dos hojas: invitados (con quién confirmó y a qué hora entró) y lista de espera.
2. Los nombres y correos son datos personales de clientes. Cuando termine el seguimiento, bórralos: en **Realtime Database → Datos**, elimina los nodos `invitados`, `confirmaciones`, `asistencias` y `espera`, o borra el proyecto completo.

## Costo

El plan gratuito de Firebase (Spark) alcanza de sobra para este evento y no pide tarjeta. La página del invitado se desconecta de Firebase en cuanto tiene su pase, para no acercarse al límite de conexiones simultáneas del plan gratuito.

## Si algo no funciona

| Qué pasa | Qué revisar |
|---|---|
| La página dice "Vista previa con datos de ejemplo" | `config.js` todavía tiene `PEGA_AQUI` o no se subió la versión editada a GitHub. |
| Recepción o panel dicen que la cuenta no tiene acceso | Falta su UID en `staff` (paso 4) o el valor está mal escrito (`admin` o `recepcion`, en minúsculas). |
| El panel dice que no hay permiso para una acción | Tu UID debe tener el valor `admin` en `staff`. |
| No abre la cámara | Hay que dar permiso de cámara al navegador. La página debe abrirse con `https://`. |
| Un invitado dice que no lo encuentra | Suele ser el correo mal escrito o distinto al de la invitación. Búscalo en el panel. |
| Cambió la fecha, la hora o el lugar | Edita `config.js`, súbelo de nuevo a GitHub y se actualiza en las tres páginas. |
