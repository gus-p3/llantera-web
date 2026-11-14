import { ArrowRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useRecurso } from '../../shared/api/useRecurso'
import { Banner } from '../../shared/ui/Banner'
import { Boton } from '../../shared/ui/Boton'
import { Encabezado } from '../../shared/ui/Encabezado'
import { Cargando, Vacio } from '../../shared/ui/Estados'
import { EtiquetaEstado } from '../../shared/ui/Etiquetas'
import { MenuFila } from '../../shared/ui/MenuFila'
import { Confirmacion } from '../../shared/ui/Modal'
import { Tabla, type Columna } from '../../shared/ui/Tabla'
import {
  fechaCorta,
  fechaLarga,
  formatoNota,
  formatoPlaca,
  formatoTelefono,
  mesYAnio,
  nombreCompleto,
} from '../../shared/util/formato'
import type { PedidoResumen } from '../pedidos/pedidos.api'
import { VehiculoModal } from '../vehiculos/components/VehiculoModal'
import { eliminarCliente, obtenerCliente } from './clientes.api'
import { ClienteModal } from './components/ClienteModal'

const COLUMNAS_PEDIDOS: Columna<PedidoResumen>[] = [
  { encabezado: 'Nota', celda: (pedido) => <span className="mono">{formatoNota(pedido.numeroNota)}</span> },
  { encabezado: 'Vehículo', celda: (pedido) => `${pedido.vehiculo.marca} ${pedido.vehiculo.modelo}` },
  { encabezado: 'Servicio', celda: (pedido) => pedido.descripcion },
  { encabezado: 'Ingreso', celda: (pedido) => fechaCorta(pedido.fechaIngreso) },
  { encabezado: 'Estado', celda: (pedido) => <EtiquetaEstado estado={pedido.estado.clave} /> },
]

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | number }) {
  return (
    <div>
      <div className="dato-etiqueta">{etiqueta}</div>
      <div className="dato-valor">{valor}</div>
    </div>
  )
}

export function ClienteDetallePage() {
  const id = Number(useParams().id)
  const navegar = useNavigate()
  const [editando, setEditando] = useState(false)
  const [agregandoVehiculo, setAgregandoVehiculo] = useState(false)
  const [eliminando, setEliminando] = useState(false)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)
  const { datos: cliente, error, cargando, recargar } = useRecurso(() => obtenerCliente(id), [id])

  if (cargando && !cliente) return <Cargando />
  if (!cliente) return <Banner tipo="error">{error}</Banner>

  const nombre = nombreCompleto(cliente)

  async function confirmarEliminar() {
    try {
      await eliminarCliente(id)
      navegar('/clientes')
    } catch (causa) {
      setErrorEliminar((causa as Error).message)
    }
  }

  return (
    <div className="pagina">
      <Encabezado
        migas={[{ etiqueta: 'Clientes', ruta: '/clientes' }, { etiqueta: nombre }]}
        titulo={nombre}
        acciones={
          <>
            <Boton onClick={() => setEditando(true)}>Editar cliente</Boton>
            <Boton
              variante="destructivo"
              disabled={!cliente.puedeEliminar}
              title={cliente.puedeEliminar ? undefined : 'Tiene pedidos; se conserva su historial.'}
              onClick={() => {
                setErrorEliminar(null)
                setEliminando(true)
              }}
            >
              Eliminar
            </Boton>
          </>
        }
      />

      {error && <Banner tipo="error">{error}</Banner>}

      <section className="tarjeta pila">
        <div className="rejilla-4">
          <Dato etiqueta="Teléfono (WhatsApp)" valor={formatoTelefono(cliente.telefono)} />
          <Dato etiqueta="Cliente desde" valor={mesYAnio(cliente.creadoEn)} />
          <Dato etiqueta="Vehículos" valor={cliente.vehiculos} />
          <Dato etiqueta="Pedidos realizados" valor={cliente.pedidosTotales} />
        </div>
        {cliente.notas && <p className="texto-suave">Observaciones: {cliente.notas}</p>}
      </section>

      <div className="fila-seccion">
        <h2 className="titulo-seccion">Vehículos del cliente</h2>
        <Boton onClick={() => setAgregandoVehiculo(true)}>
          <Plus size={16} aria-hidden="true" />
          Agregar vehículo
        </Boton>
      </div>
      {cliente.listaVehiculos.length === 0 ? (
        <Vacio>Este cliente aún no tiene vehículos.</Vacio>
      ) : (
        <div className="rejilla-2">
          {cliente.listaVehiculos.map((vehiculo) => (
            <article key={vehiculo.id} className="tarjeta pila">
              <div className="fila-seccion">
                <span className="dato-valor">
                  {vehiculo.marca.nombre} {vehiculo.modelo} {vehiculo.anio}
                </span>
                <span className="texto-suave">Último servicio: {fechaLarga(vehiculo.ultimoServicio)}</span>
              </div>
              {vehiculo.color && <p className="texto-suave">{vehiculo.color}</p>}
              <div className="fila-seccion">
                <span className="chip-placa">{formatoPlaca(vehiculo.placas)}</span>
                <Link to={`/vehiculos/${vehiculo.id}`} className="enlace-flecha">
                  Ver detalle <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      <h2 className="titulo-seccion">Pedidos del cliente</h2>
      <Tabla
        columnas={COLUMNAS_PEDIDOS}
        filas={cliente.listaPedidos}
        claveDe={(pedido) => pedido.id}
        vacio="Este cliente aún no tiene pedidos."
        menu={(pedido) => (
          <MenuFila
            etiqueta={`Acciones de la nota ${formatoNota(pedido.numeroNota)}`}
            opciones={[{ etiqueta: 'Ver detalle', alElegir: () => navegar(`/pedidos/${pedido.id}`) }]}
          />
        )}
      />

      {editando && (
        <ClienteModal
          cliente={cliente}
          alCerrar={() => setEditando(false)}
          alGuardar={() => {
            setEditando(false)
            void recargar()
          }}
        />
      )}
      {agregandoVehiculo && (
        <VehiculoModal
          idCliente={id}
          alCerrar={() => setAgregandoVehiculo(false)}
          alGuardar={() => {
            setAgregandoVehiculo(false)
            void recargar()
          }}
        />
      )}
      {eliminando && (
        <Confirmacion
          titulo="Eliminar cliente"
          mensaje={`¿Eliminar a ${nombre} y sus vehículos? Esta acción no se puede deshacer.`}
          etiquetaConfirmar="Eliminar cliente"
          error={errorEliminar}
          alConfirmar={confirmarEliminar}
          alCancelar={() => setEliminando(false)}
        />
      )}
    </div>
  )
}
