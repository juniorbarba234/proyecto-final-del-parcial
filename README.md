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

## Cómo funciona

1. El encargado registra al alumno una sola vez con su matrícula, carrera, semestre y datos del vehículo.
2. Para entrar o salir, escanea la matrícula de la credencial o la escribe manualmente.
3. La app muestra los datos guardados para revisar que el alumno y las placas coincidan.
4. Al confirmar, registra la entrada, la salida, la ocupación y el tiempo de permanencia.
5. Todo se guarda localmente en el dispositivo, sin base de datos ni internet.

Es un prototipo académico con datos de demostración. La app no consulta el padrón oficial de la universidad.

