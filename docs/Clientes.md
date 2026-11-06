# Clientes

## Ventana «Nuevo cliente y vehículo»

`NuevoClienteVehiculoModal` registra cliente y vehículo en un solo paso. Si falla el vehículo, no queda el cliente a medias. Importa el formulario de vehículo y no lo copia.

| Prop | Tipo | Descripción |
|---|---|---|
| `alGuardar` | `({ cliente, vehiculo }) => void` | Recibe lo creado. |
| `alCerrar` | `() => void` | Cierra sin guardar. |
| `ayuda` | `string` | Opcional. Texto junto a los botones. |

Desde otro módulo, se monta encima de la pantalla actual. Como el estado vive en la pantalla, lo ya capturado no se pierde:

```tsx
{abierta && (
  <NuevoClienteVehiculoModal
    ayuda="Al guardar regresas al pedido con el cliente y su vehículo ya seleccionados."
    alCerrar={() => setAbierta(false)}
    alGuardar={({ cliente, vehiculo }) => {
      setAbierta(false)
      setCliente(cliente)
      setIdVehiculo(vehiculo.id)
    }}
  />
)}
```

Móntala fuera de cualquier `<form>`: React propaga el `submit` a través de los portales.

## Campos del cliente

La captura usa `Nombre` y `Apellidos` por separado, en lugar del «Nombre completo» del boceto, porque el modelo de datos guarda ambos por separado.
