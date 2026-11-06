# Base del frontend

## Kit de UI

Todo está en `src/shared/ui` y se puede ver funcionando en `/muestra-ui`.

| Componente | Uso |
|---|---|
| `Boton` | Variantes `principal`, `secundario` y `destructivo`. |
| `Banner` | Tipos `informacion`, `exito`, `advertencia` y `error`. |
| `EtiquetaEstado`, `EtiquetaAlerta` | Siempre con texto e ícono. |
| `Tabla`, `Paginacion` | Tabla con orden por columna y menú por fila. |
| `MenuFila` | Menú de tres puntos. Una opción deshabilitada explica el motivo con `ayuda`. |
| `Modal`, `Confirmacion` | Ventanas. Las acciones irreversibles usan `Confirmacion`. |
| `CampoTexto`, `CampoArea`, `Buscador` | Campos de formulario. |
| `Autocompletar` | Selector con sugerencias y `accion` explícita al final de la lista. |
| `Encabezado` | Título, migas y acciones de cada pantalla. |

## Cargar datos

```tsx
const { datos, error, cargando, recargar } = useRecurso(() => listarClientes({ q, pagina }), [q, pagina])
```

Las dependencias deben ser valores simples, como filtros y número de página.

## Sesión

- `useSesion()` entrega `usuario`, `iniciarSesion`, `cambiarPassword` y `cerrarSesion`.
- El token vive en `sessionStorage`: al cerrar el navegador en la PC del taller, la sesión termina.
- `RutaProtegida` envía al login si no hay sesión, y al cambio de contraseña si está pendiente.
- Si la API responde 401, la sesión se cierra y la aplicación regresa al login.
