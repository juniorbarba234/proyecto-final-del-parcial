# Guion de exposición — AccesoUni

## Problema (30 segundos)
En la universidad no se lleva un registro claro de los vehículos que entran y salen. Mi propuesta organiza el acceso utilizando la matrícula del alumno y las placas de su vehículo.

## Solución (30 segundos)
AccesoUni es una aplicación móvil para el guardia. Consulta un padrón local, muestra si el alumno está habilitado y registra cada entrada y salida. El estacionamiento es gratuito.

## Demostración (3 minutos)
1. Mostrar la bienvenida, abrir el menú lateral y explicar las pantallas.
2. Mostrar una credencial ficticia en computadora o impresa, escanearla con el teléfono y confirmar entrada.
3. Mostrar la ocupación y el vehículo dentro.
4. Intentar una entrada duplicada y una matrícula deshabilitada.
5. Registrar la salida y mostrar el tiempo de permanencia.
6. Crear un alumno ficticio y mostrar su credencial QR.

## Conceptos usados (1 minuto)
Componentes reutilizables, estado con hooks, listas FlatList, formularios y validaciones, menú lateral, modales, Animated, cámara, cálculos de tiempo y almacenamiento JSON local. No utiliza base de datos ni peticiones a APIs.

## Límites y mejora futura (30 segundos)
Es un prototipo en un dispositivo. No demuestra identidad solo por leer un QR: se requiere revisión de la credencial oficial. Para uso real se necesitarían autenticación, autorización institucional, protección de datos y sincronización; esas funciones están fuera de esta actividad local.

## Antes de salir a clase
- Instalar dependencias y abrir el proyecto con Expo Go actualizado y compatible.
- Dar permiso de cámara y probar un QR desde otra pantalla.
- Tener las credenciales demo impresas o abiertas en computadora.
- Mantener computadora y servidor Expo encendidos para cargar el proyecto.
- Si el túnel falla, probar misma Wi-Fi con `npx expo start --lan`.
- Plan B: captura manual `20260001`; no presentar simulación como lectura real.
- Verificar reapertura y guardado, aforo, entrada y salida en el teléfono.
- Completar diseño en Figma y entregar los enlaces requeridos por el profesor.
