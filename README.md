# Proyecto final del parcial · AccesoUni

Prototipo académico de control de estacionamiento universitario gratuito, hecho con React Native y Expo Go. La matrícula identifica al alumno y las placas a su vehículo. No abre barreras físicas ni verifica un padrón institucional.

## Requisitos de la actividad

| Requisito | Implementación |
|---|---|
| React Native / Expo Go | App.js y CameraView |
| Splash | Bienvenida dentro de la app, visible también en Expo Go |
| NavDrawer | Menú lateral propio, animado con Animated, siete pantallas |
| Modales | Registro, autorización, resultado, capacidad y confirmación de borrado |
| Animaciones | Entrada de pantallas y desplazamiento del menú lateral |
| Listas y formularios | FlatList, TextInput, Switch, búsqueda y validación |
| Cálculos | Ocupación, aforo disponible, entradas del día y permanencia |
| Persistencia sin base de datos | Archivo JSON con expo-file-system en Android/iOS; localStorage en web |
| Figma | [Pantallas editables de AccesoUni UCC](https://www.figma.com/design/P9S5Zx0whX8baNLnFUgmuV) |

## Demostración

En el alta y edición de alumnos, Carrera es un selector con búsqueda y las 21 licenciaturas agrupadas por área de la [oferta oficial UCC](https://www.ucc.mx/licenciaturas/), consultada el 5 de octubre de 2026. El catálogo está incluido en `src/careers.cjs`: funciona sin conexión y se actualiza manualmente. Los nombres guardados anteriormente se conservan hasta que selecciones otro.

1. En Inicio observa 40 lugares disponibles.
2. Abre Control de acceso y selecciona Entrada.
3. Escanea `ACCESOUNI:20260001` de las credenciales imprimibles, o escribe `20260001`.
4. Revisa datos y confirma entrada: ocupación aumenta a uno.
5. Repite la misma entrada: la app la rechaza sin duplicar registros.
6. Prueba `20260003`: alumno deshabilitado. Prueba `99999999`: desconocido.
7. En Vehículos dentro registra la salida y consulta el historial.
8. Registra un alumno ficticio nuevo y revisa su QR en Credenciales demo.
9. Cierra y vuelve a abrir la app para comprobar persistencia.

Credenciales demo: Ana Torres (20260001) y Luis Medina (20260002) están habilitados; Sofía Ruiz (20260003) está deshabilitada. Ningún dato es real. La simulación de lectura usa exactamente las mismas validaciones que la cámara.

El lector admite QR y algunos códigos de barras cuyo contenido sea la matrícula en texto o `ACCESOUNI:MATRICULA`. No extrae texto de una fotografía, no lee tarjetas NFC y no interpreta formatos institucionales desconocidos. Antes de usar credenciales reales hay que conocer su contenido.

## Seguridad y alcance

La ficha del alumno incluye nombre, matrícula, carrera, semestre, vigencia de la credencial y fotografía opcional tomada con la cámara. Los registros anteriores conservan sus datos: los nuevos campos aparecen como no registrados hasta editarlos. La vigencia es informativa; el operador debe comprobarla. La aplicación no extrae estos datos de una fotografía ni del código de barras: consulta el padrón local por matrícula. No se reproducen firmas del rector ni elementos para emitir una credencial oficial. Las tarjetas generadas siguen marcadas como demostración.

- Es un prototipo para un operador en un solo dispositivo, no un sistema de seguridad de producción.
- Un QR se puede copiar: el guardia compara físicamente al alumno con la foto de su credencial y revisa las placas.
- El padrón se administra localmente y no tiene autenticación institucional. Usar únicamente datos ficticios.
- Un vehículo por matrícula. No incluye visitantes, cobros, nube, APIs, fetch ni bases de datos.
- No admite modificar al alumno mientras su vehículo está dentro; sí permite salir a un alumno deshabilitado que ya estaba dentro.
- Guarda antes de confirmar éxito. Si falla la escritura, no aplica el cambio. Conserva una copia `.bak` de la versión anterior del archivo; no restaura automáticamente archivos inválidos.
- Desinstalar Expo Go o borrar sus datos puede eliminar registros. No es una copia de seguridad institucional.

