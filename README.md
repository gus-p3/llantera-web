# taller-front

Interfaz del sistema de gestión de Taller y Llantera del Bosque. React, TypeScript y Vite.

## Levantar el proyecto

Requisitos: Node.js 22 o superior y [`taller-back`](../taller-back/README.md) corriendo en el puerto 3000.

```bash
npm install
npm run dev
```

Abre <http://localhost:5173>. Vite reenvía `/api` a la API.

Con los datos de ejemplo de `taller-back`, entra con `secretaria.demo` o `admin.demo` y la contraseña `SEED_PASSWORD`.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo. |
| `npm run build` | Revisa los tipos y compila a `dist/`. |
| `npm run lint` | Revisa el código. |
| `npm test` | Corre las pruebas. |

## Estructura

| Carpeta | Contenido | Dueño |
|---|---|---|
| `src/shared` | Router, layout, sesión, cliente HTTP, tokens y kit de UI | Lizeth |
| `src/features/auth`, `src/features/inicio` | Acceso y panel Inicio | Lizeth |
| `src/features/clientes`, `src/features/promociones` | Clientes y promociones | Karen |
| `src/features/vehiculos`, `src/features/marcas` | Vehículos | Cesar |
| `src/features/pedidos` | Pedidos | Zahir |

- Los colores, tipografías y espacios son variables en `src/shared/styles/tokens.css`. No uses valores sueltos.
- El kit de componentes se puede ver en `/muestra-ui`.
- La documentación de los componentes compartidos está en [`docs/`](docs/) y el flujo de trabajo en [CONTRIBUTING.md](CONTRIBUTING.md).

## Rutas reservadas

Inicio y Pedidos se construyen en el Sprint 4, igual que el detalle del pedido. Promociones se construye en el Sprint 5. Sus rutas ya existen y muestran un aviso.
