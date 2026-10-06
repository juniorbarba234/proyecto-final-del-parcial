# Verificación del prototipo

- 15 pruebas automatizadas pasaron: lectura de matrícula/QR, alta, duplicados, alumno inactivo, aforo, salida, duración, historial, semestre, fechas, fotografía local y catálogo/búsqueda de carreras UCC.
- Exportación con bytecode Hermes para Android e iOS: correcta.
- Dependencias: comparación offline contra las versiones incluidas en Expo, correcta. La consulta online de compatibilidad falló por permisos del caché de Windows.
- Vista previa web: inicio cargado y entrada manual de Ana Torres confirmada con mensaje de guardado local.
- Pendiente: prueba física del escáner y persistencia nativa en el teléfono con Expo Go. La prueba web no valida cámara Android/iOS.
- Diseño: diez pantallas editables creadas en [Figma](https://www.figma.com/design/P9S5Zx0whX8baNLnFUgmuV), con componentes reutilizables, texto Roboto y emblema UCC vectorial. Publicación final en GitHub pendiente.
- Ampliación de credencial: carrera, semestre, vigencia y captura de fotografía local. La cámara de fotografía todavía requiere prueba física.
- Auditoría npm: 24 avisos (8 moderados, 16 altos) en el árbol instalado, principalmente herramientas/transitivas de Expo/React Native. No se aplicó `npm audit fix --force`, pues propone cambios incompatibles con el SDK. No desplegar este prototipo como sistema institucional sin revisión.

## Windows: exportación en un entorno restringido

La primera exportación falló al escribir bytecode en el directorio temporal aislado. La exportación terminó correctamente usando una carpeta temporal propia:

```powershell
New-Item -ItemType Directory -Force .build-tmp | Out-Null
$env:TEMP=(Resolve-Path .build-tmp).Path
$env:TMP=$env:TEMP
npx expo export --platform android --platform ios
```

`.build-tmp`, `dist`, `node_modules` y `.expo` están excluidos de Git. Este ajuste solo afecta la sesión de terminal.
