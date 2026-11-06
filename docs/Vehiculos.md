# Vehículos

## Formulario de vehículo

`FormularioVehiculo` es un formulario controlado que sirve para crear y para editar. Los campos son marca con autocompletar, modelo, año, color, placa y notas.

| Prop | Tipo | Descripción |
|---|---|---|
| `valor` | `ValorVehiculo` | Valores actuales. |
| `alCambiar` | `(valor) => void` | Recibe el formulario actualizado. |
| `errores` | `ErroresDeCampo` | Opcional. Mensajes por campo: `marca`, `modelo`, `placas`, `anio`. |

`vehiculoFormulario.ts` trae las funciones de apoyo:

| Función | Uso |
|---|---|
| `vehiculoVacio()` | Valor inicial para crear. |
| `vehiculoAValor(vehiculo)` | Valor inicial para editar. |
| `validarVehiculo(valor)` | Errores por campo antes de enviar. |
| `valorAPeticion(valor)` | Convierte el valor al cuerpo que espera la API. |

```tsx
const [valor, setValor] = useState(vehiculoVacio)
const [errores, setErrores] = useState<ErroresDeCampo>({})

<FormularioVehiculo valor={valor} alCambiar={setValor} errores={errores} />
```

## Ventana de vehículo

`VehiculoModal` ya resuelve la validación, el guardado y la placa repetida.

```tsx
<VehiculoModal idCliente={cliente.id} alGuardar={alGuardar} alCerrar={alCerrar} />
<VehiculoModal vehiculo={vehiculo} alGuardar={alGuardar} alCerrar={alCerrar} />
```

Con `idCliente` agrega un vehículo a ese cliente. Con `vehiculo` lo edita.
