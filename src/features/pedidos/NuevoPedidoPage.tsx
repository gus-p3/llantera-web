import { Plus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import type { ErrorHttp, ErroresDeCampo } from '../../shared/api/http'
import { Autocompletar } from '../../shared/ui/Autocompletar'
import { Banner } from '../../shared/ui/Banner'
import { Boton } from '../../shared/ui/Boton'
import { CampoArea, CampoTexto } from '../../shared/ui/Campo'
import { Encabezado } from '../../shared/ui/Encabezado'
import {
  fechaLarga,
  formatoNota,
  formatoPlaca,
  formatoTelefono,
  hoyIso,
  nombreCompleto,
} from '../../shared/util/formato'
import { listarClientes, obtenerCliente, type Cliente } from '../clientes/clientes.api'
import { NuevoClienteVehiculoModal } from '../clientes/components/NuevoClienteVehiculoModal'
import { VehiculoModal } from '../vehiculos/components/VehiculoModal'
import type { Vehiculo } from '../vehiculos/vehiculos.api'
import { useRecurso } from '../../shared/api/useRecurso'
import { Cargando } from '../../shared/ui/Estados'
import {
  actualizarPedido,
  buscarEncargados,
  buscarProductos,
  crearEncargado,
  crearPedido,
  obtenerPedido,
  type Encargado,
  type PedidoDetalle,
  type Producto,
} from './pedidos.api'

type ProductoElegido = Producto | { id?: undefined; nombre: string }
type EncargadoElegido = Pick<Encargado, 'id' | 'nombre' | 'apellidos'>

// «Editar pedido» usa el mismo formulario; el cliente y el vehículo ya no se cambian.
export function EditarPedidoPage() {
  const id = Number(useParams().id)
  const { datos, error } = useRecurso(() => obtenerPedido(id), [id])
  if (error) return <Banner tipo="error">{error}</Banner>
  return datos ? <NuevoPedidoPage pedido={datos} /> : <Cargando />
}

const mismoTexto = (a: string, b: string) => a.trim().localeCompare(b.trim(), 'es', { sensitivity: 'base' }) === 0

const buscarClientes = async (q: string) => (await listarClientes({ q, limite: 8 })).datos

export function NuevoPedidoPage({ pedido }: { pedido?: PedidoDetalle }) {
  const navegar = useNavigate()
  const hoy = hoyIso()
  const ingreso = pedido?.fechaIngreso ?? hoy
  const responsable = pedido?.encargados.find((e) => e.esResponsable) ?? pedido?.encargados[0]
  // El formulario maneja un encargado; los demás del pedido se conservan al guardar.
  const otrosEncargados = (pedido?.encargados ?? [])
    .filter((e) => e !== responsable)
    .map((e) => ({ idEmpleado: e.idEmpleado, esResponsable: false }))
  const volver = pedido ? `/pedidos/${pedido.id}` : '/pedidos'

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [textoCliente, setTextoCliente] = useState('')
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [idVehiculo, setIdVehiculo] = useState<number | null>(null)

  const [fechaEstimada, setFechaEstimada] = useState(pedido?.fechaEstimadaEntrega ?? '')
  const [descripcion, setDescripcion] = useState(pedido?.descripcion ?? '')
  const [observaciones, setObservaciones] = useState(pedido?.observaciones ?? '')
  const [productos, setProductos] = useState<ProductoElegido[]>(pedido?.productos ?? [])
  const [textoProducto, setTextoProducto] = useState('')
  const [encargado, setEncargado] = useState<EncargadoElegido | null>(
    responsable ? { id: responsable.idEmpleado, nombre: responsable.nombre, apellidos: responsable.apellidos } : null,
  )
  const [textoEncargado, setTextoEncargado] = useState('')

  const [ventana, setVentana] = useState<'cliente' | 'vehiculo' | null>(null)
  const [errores, setErrores] = useState<ErroresDeCampo>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function elegirCliente(elegido: Cliente) {
    setCliente(elegido)
    setTextoCliente('')
    setIdVehiculo(null)
    try {
      const { listaVehiculos } = await obtenerCliente(elegido.id)
      setVehiculos(listaVehiculos)
      if (listaVehiculos.length === 1) setIdVehiculo(listaVehiculos[0].id)
    } catch (causa) {
      setErrorGeneral((causa as Error).message)
    }
  }

  function agregarProducto(producto: ProductoElegido) {
    setTextoProducto('')
    setProductos((actuales) =>
      actuales.some((actual) => mismoTexto(actual.nombre, producto.nombre)) ? actuales : [...actuales, producto],
    )
  }

  async function agregarEncargadoNuevo(nombre: string) {
    try {
      setEncargado(await crearEncargado(nombre))
      setTextoEncargado('')
    } catch (causa) {
      setErrorGeneral((causa as Error).message)
    }
  }

  function validar() {
    const encontrados: ErroresDeCampo = {}
    if (!pedido && !cliente) encontrados.cliente = 'Selecciona o agrega un cliente.'
    if (!pedido && !idVehiculo) encontrados.idVehiculo = 'Selecciona el vehículo.'
    if (!descripcion.trim()) encontrados.descripcion = 'Describe el servicio solicitado.'
    if (!fechaEstimada) encontrados.fechaEstimadaEntrega = 'Indica la fecha estimada de entrega.'
    else if (fechaEstimada < ingreso) {
      encontrados.fechaEstimadaEntrega = 'La fecha estimada no puede ser anterior al ingreso.'
    }
    return encontrados
  }

  async function guardar(evento: FormEvent) {
    evento.preventDefault()
    const encontrados = validar()
    setErrores(encontrados)
    setErrorGeneral(null)
    if (Object.keys(encontrados).length > 0) return

    const datos = {
      descripcion: descripcion.trim(),
      fechaEstimadaEntrega: fechaEstimada,
      observaciones: observaciones.trim() || null,
      productos: productos.map((producto) => (producto.id ? { id: producto.id } : { nombre: producto.nombre })),
      encargados: [...(encargado ? [{ idEmpleado: encargado.id, esResponsable: true }] : []), ...otrosEncargados],
    }
    setGuardando(true)
    try {
      if (pedido) {
        await actualizarPedido(pedido.id, { ...datos, precioTotal: pedido.precioTotal })
        navegar(volver, { state: { aviso: 'Pedido guardado correctamente.' } })
        return
      }
      if (!idVehiculo) return
      const creado = await crearPedido({ idVehiculo, ...datos })
      navegar('/pedidos', { state: { aviso: `Pedido creado con la nota ${formatoNota(creado.numeroNota)}.` } })
    } catch (causa) {
      const error = causa as ErrorHttp
      if (Object.keys(error.campos ?? {}).length > 0) setErrores(error.campos)
      else setErrorGeneral(error.message)
      setGuardando(false)
    }
  }

  return (
    <div className="pagina">
      <Encabezado
        migas={
          pedido
            ? [
                { etiqueta: 'Pedidos', ruta: '/pedidos' },
                { etiqueta: `Nota ${formatoNota(pedido.numeroNota)}`, ruta: volver },
                { etiqueta: 'Editar' },
              ]
            : [{ etiqueta: 'Pedidos', ruta: '/pedidos' }, { etiqueta: 'Nuevo pedido' }]
        }
        titulo={pedido ? 'Editar pedido' : 'Nuevo pedido'}
      />

      {errorGeneral && <Banner tipo="error">{errorGeneral}</Banner>}

      <form className="tarjeta pila" onSubmit={guardar} noValidate>
        <div className="rejilla-2">
          {pedido ? (
            <div className="pila">
              <h2 className="titulo-seccion">1 · Cliente</h2>
              <div>
                <div className="dato-valor">{nombreCompleto(pedido.cliente)}</div>
                <div className="texto-suave">{formatoTelefono(pedido.cliente.telefono)}</div>
              </div>
              <h2 className="titulo-seccion">2 · Vehículo del cliente</h2>
              <div>
                <div className="dato-valor">
                  {pedido.vehiculo.marca} {pedido.vehiculo.modelo} {pedido.vehiculo.anio ?? ''}
                </div>
                <span className="chip-placa">{formatoPlaca(pedido.vehiculo.placas)}</span>
              </div>
              <p className="texto-suave">El cliente y el vehículo de un pedido no se cambian.</p>
            </div>
          ) : (
          <div className="pila">
            <h2 className="titulo-seccion">1 · Cliente</h2>
            {cliente ? (
              <div className="fila-seccion">
                <div>
                  <div className="dato-valor">{nombreCompleto(cliente)}</div>
                  <div className="texto-suave">{formatoTelefono(cliente.telefono)}</div>
                </div>
                <Boton
                  onClick={() => {
                    setCliente(null)
                    setVehiculos([])
                    setIdVehiculo(null)
                  }}
                >
                  Cambiar cliente
                </Boton>
              </div>
            ) : (
              <>
                <Autocompletar<Cliente>
                  etiqueta="Buscar cliente"
                  placeholder="Nombre, teléfono o placa"
                  texto={textoCliente}
                  alCambiarTexto={setTextoCliente}
                  buscar={buscarClientes}
                  alElegir={elegirCliente}
                  claveDe={(opcion) => opcion.id}
                  mostrar={(opcion) => (
                    <>
                      <span className="fuerte">{nombreCompleto(opcion)}</span>
                      <span className="texto-suave">{formatoTelefono(opcion.telefono)}</span>
                    </>
                  )}
                  error={errores.cliente}
                />
                <div className="fila-controles">
                  <span className="texto-suave">¿El cliente no aparece?</span>
                  <Boton onClick={() => setVentana('cliente')}>
                    <Plus size={16} aria-hidden="true" />
                    Agregar cliente nuevo
                  </Boton>
                </div>
              </>
            )}

            <h2 className="titulo-seccion">2 · Vehículo del cliente</h2>
            {cliente ? (
              <div className="rejilla-2">
                {vehiculos.map((vehiculo) => (
                  <button
                    key={vehiculo.id}
                    type="button"
                    className="tarjeta-opcion"
                    aria-pressed={vehiculo.id === idVehiculo}
                    onClick={() => setIdVehiculo(vehiculo.id)}
                  >
                    <span className="fuerte">
                      {vehiculo.marca.nombre} {vehiculo.modelo} {vehiculo.anio}
                    </span>
                    <span className="dato-clave">{formatoPlaca(vehiculo.placas)}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className="tarjeta-opcion tarjeta-opcion-agregar"
                  onClick={() => setVentana('vehiculo')}
                >
                  <Plus size={16} aria-hidden="true" />
                  Agregar vehículo
                </button>
              </div>
            ) : (
              <p className="texto-suave">Primero selecciona al cliente.</p>
            )}
            {errores.idVehiculo && <p className="campo-error">{errores.idVehiculo}</p>}
          </div>
          )}

          <div className="pila">
            <h2 className="titulo-seccion">3 · Servicio</h2>
            <div className="rejilla-2">
              <CampoTexto
                etiqueta="N.º de nota"
                readOnly
                mono={Boolean(pedido)}
                value={pedido ? formatoNota(pedido.numeroNota) : 'Se asigna al guardar'}
              />
              <CampoTexto
                etiqueta="Fecha de ingreso"
                readOnly
                value={pedido ? fechaLarga(ingreso) : `${fechaLarga(hoy)} (hoy)`}
              />
            </div>
            <CampoTexto
              etiqueta="Fecha estimada de entrega"
              obligatorio
              type="date"
              min={ingreso}
              value={fechaEstimada}
              onChange={(evento) => setFechaEstimada(evento.target.value)}
              error={errores.fechaEstimadaEntrega}
            />
            <CampoArea
              etiqueta="Servicio solicitado"
              obligatorio
              placeholder="Describe el servicio solicitado…"
              value={descripcion}
              onChange={(evento) => setDescripcion(evento.target.value)}
              error={errores.descripcion}
            />

            <Autocompletar<Producto>
              etiqueta="Productos y servicios"
              placeholder="Frenos, aceite, alineación…"
              texto={textoProducto}
              alCambiarTexto={setTextoProducto}
              buscar={buscarProductos}
              alElegir={agregarProducto}
              claveDe={(opcion) => opcion.id}
              mostrar={(opcion) => opcion.nombre}
              accion={(texto, opciones) =>
                texto && !opciones.some((opcion) => mismoTexto(opcion.nombre, texto))
                  ? { etiqueta: `Agregar «${texto}»`, alElegir: () => agregarProducto({ nombre: texto }) }
                  : null
              }
            />
            {productos.length > 0 && (
              <ul className="lista-elegidos" aria-label="Productos elegidos">
                {productos.map((producto) => (
                  <li key={producto.nombre}>
                    {producto.nombre}
                    <button
                      type="button"
                      aria-label={`Quitar ${producto.nombre}`}
                      onClick={() => setProductos((actuales) => actuales.filter((actual) => actual !== producto))}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {encargado ? (
              <div className="campo">
                <span className="dato-etiqueta">Encargado</span>
                <ul className="lista-elegidos">
                  <li>
                    {nombreCompleto(encargado)}
                    <button type="button" aria-label="Quitar encargado" onClick={() => setEncargado(null)}>
                      <X size={14} aria-hidden="true" />
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Autocompletar<Encargado>
                etiqueta="Encargado"
                placeholder="Mecánico o llantero"
                texto={textoEncargado}
                alCambiarTexto={setTextoEncargado}
                buscar={buscarEncargados}
                alElegir={(opcion) => {
                  setEncargado(opcion)
                  setTextoEncargado('')
                }}
                claveDe={(opcion) => opcion.id}
                mostrar={(opcion) => (
                  <>
                    <span>{nombreCompleto(opcion)}</span>
                    <span className="texto-suave">{opcion.puesto === 'LLANTERO' ? 'Llantero' : 'Mecánico'}</span>
                  </>
                )}
                accion={(texto, opciones) =>
                  texto && opciones.length === 0
                    ? {
                        etiqueta: `Agregar «${texto}» como nuevo encargado`,
                        alElegir: () => void agregarEncargadoNuevo(texto),
                      }
                    : null
                }
              />
            )}

            <CampoArea
              etiqueta="Observaciones"
              placeholder="Observaciones (opcional)"
              rows={2}
              value={observaciones}
              onChange={(evento) => setObservaciones(evento.target.value)}
            />
          </div>
        </div>

        <div className="acciones-formulario">
          <Boton onClick={() => navegar(volver)}>Cancelar</Boton>
          <Boton variante="principal" type="submit" disabled={guardando}>
            Guardar pedido
          </Boton>
        </div>
      </form>

      {ventana === 'cliente' && (
        <NuevoClienteVehiculoModal
          ayuda="Al guardar regresas al pedido con el cliente y su vehículo ya seleccionados."
          alCerrar={() => setVentana(null)}
          alGuardar={(resultado) => {
            setVentana(null)
            setCliente(resultado.cliente)
            setVehiculos([resultado.vehiculo])
            setIdVehiculo(resultado.vehiculo.id)
          }}
        />
      )}
      {ventana === 'vehiculo' && cliente && (
        <VehiculoModal
          idCliente={cliente.id}
          alCerrar={() => setVentana(null)}
          alGuardar={(vehiculo) => {
            setVentana(null)
            setVehiculos((actuales) => [...actuales, vehiculo])
            setIdVehiculo(vehiculo.id)
          }}
        />
      )}
    </div>
  )
}
