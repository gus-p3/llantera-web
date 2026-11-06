import { Check } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useRecurso } from '../../shared/api/useRecurso'
import { Banner } from '../../shared/ui/Banner'
import { Boton } from '../../shared/ui/Boton'
import { Encabezado } from '../../shared/ui/Encabezado'
import { Cargando } from '../../shared/ui/Estados'
import { EtiquetaAlerta, type ClaveEstado } from '../../shared/ui/Etiquetas'
import { fechaLarga, formatoNota, formatoPlaca, formatoTelefono, nombreCompleto } from '../../shared/util/formato'
import { BotonAvisoWhatsApp } from '../whatsapp/BotonAvisoWhatsApp'
import { avanzarPedido, obtenerPedido, regresarPedido } from './pedidos.api'

// Mismo orden que estado_pedido.orden en la base.
const PASOS: { clave: ClaveEstado; texto: string }[] = [
  { clave: 'RECIBIDO', texto: 'Recibido' },
  { clave: 'EN_SERVICIO', texto: 'En servicio' },
  { clave: 'LISTO', texto: 'Listo para recoger' },
  { clave: 'ENTREGADO', texto: 'Entregado' },
]

function Dato({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <div className="dato-etiqueta">{etiqueta}</div>
      <div className="dato-valor">{children}</div>
    </div>
  )
}

export function PedidoDetallePage() {
  const id = Number(useParams().id)
  const navegar = useNavigate()
  const aviso = (useLocation().state as { aviso?: string } | null)?.aviso
  const [ocupado, setOcupado] = useState(false)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)
  const { datos: pedido, error, cargando, recargar } = useRecurso(() => obtenerPedido(id), [id])

  if (cargando && !pedido) return <Cargando />
  if (!pedido) return <Banner tipo="error">{error}</Banner>

  const indice = PASOS.findIndex((paso) => paso.clave === pedido.estado.clave)
  const siguiente = PASOS[indice + 1]
  const nota = formatoNota(pedido.numeroNota)

  async function mover(accion: typeof avanzarPedido) {
    setOcupado(true)
    setErrorAccion(null)
    try {
      await accion(id)
      await recargar()
    } catch (causa) {
      setErrorAccion((causa as Error).message)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="pagina">
      <Encabezado
        migas={[{ etiqueta: 'Pedidos', ruta: '/pedidos' }, { etiqueta: `Nota ${nota}` }]}
        titulo={
          <>
            Nota <span className="mono">{nota}</span>
          </>
        }
        subtitulo={pedido.alerta && <EtiquetaAlerta alerta={pedido.alerta} />}
        acciones={<Boton onClick={() => navegar(`/pedidos/${id}/editar`)}>Editar pedido</Boton>}
      />

      {aviso && <Banner tipo="exito">{aviso}</Banner>}
      {errorAccion && <Banner tipo="error">{errorAccion}</Banner>}

      <section className="tarjeta pila">
        <ol className="barra-estados" aria-label="Estado del pedido">
          {PASOS.map((paso, posicion) => (
            <li
              key={paso.clave}
              className={posicion < indice ? 'hecho' : posicion === indice ? 'actual' : undefined}
              aria-current={posicion === indice ? 'step' : undefined}
            >
              <span className="barra-estados-punto">{posicion < indice ? <Check size={14} aria-hidden="true" /> : posicion + 1}</span>
              {paso.texto}
            </li>
          ))}
        </ol>
        <div className="fila-controles">
          {indice > 0 && (
            <Boton disabled={ocupado} onClick={() => void mover(regresarPedido)}>
              ← Regresar a «{PASOS[indice - 1].texto}»
            </Boton>
          )}
          {siguiente && (
            <Boton variante="principal" disabled={ocupado} onClick={() => void mover(avanzarPedido)}>
              Marcar como «{siguiente.texto}»
            </Boton>
          )}
          {pedido.estado.clave === 'LISTO' && <BotonAvisoWhatsApp cliente={pedido.cliente} vehiculo={pedido.vehiculo} />}
        </div>
      </section>

      <div className="rejilla-2">
        <section className="tarjeta pila">
          <h2 className="titulo-seccion">Datos del pedido</h2>
          <div className="rejilla-2">
            <Dato etiqueta="Fecha de ingreso">{fechaLarga(pedido.fechaIngreso)}</Dato>
            <Dato etiqueta="Entrega estimada">{fechaLarga(pedido.fechaEstimadaEntrega)}</Dato>
            <Dato etiqueta="Fecha de salida">{pedido.fechaSalida ? fechaLarga(pedido.fechaSalida) : '— en curso'}</Dato>
            <Dato etiqueta="Encargado">
              {pedido.encargados.length ? pedido.encargados.map(nombreCompleto).join(', ') : '—'}
            </Dato>
          </div>
          <Dato etiqueta="Servicio solicitado">{pedido.descripcion}</Dato>
          <Dato etiqueta="Productos y servicios">
            {pedido.productos.length ? (
              <ul className="lista-elegidos">
                {pedido.productos.map((producto) => (
                  <li key={producto.id}>{producto.nombre}</li>
                ))}
              </ul>
            ) : (
              '—'
            )}
          </Dato>
          <Dato etiqueta="Observaciones">{pedido.observaciones ?? '—'}</Dato>
        </section>

        <div className="pila">
          <section className="tarjeta pila">
            <div className="fila-seccion">
              <h2 className="titulo-seccion">Cliente</h2>
              <Link to={`/clientes/${pedido.cliente.id}`}>Ver cliente ›</Link>
            </div>
            <div className="dato-valor">{nombreCompleto(pedido.cliente)}</div>
            <p className="texto-suave">Tel. {formatoTelefono(pedido.cliente.telefono)}</p>
          </section>
          <section className="tarjeta pila">
            <div className="fila-seccion">
              <h2 className="titulo-seccion">Vehículo</h2>
              <Link to={`/vehiculos/${pedido.vehiculo.id}`}>Ver vehículo ›</Link>
            </div>
            <div className="dato-valor">
              {pedido.vehiculo.marca} {pedido.vehiculo.modelo} {pedido.vehiculo.anio ?? ''}
            </div>
            <span className="chip-placa">{formatoPlaca(pedido.vehiculo.placas)}</span>
          </section>
        </div>
      </div>
    </div>
  )
}
