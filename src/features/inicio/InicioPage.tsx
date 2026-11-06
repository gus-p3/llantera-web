import { Link } from 'react-router-dom'
import { useRecurso } from '../../shared/api/useRecurso'
import { Banner } from '../../shared/ui/Banner'
import { Encabezado } from '../../shared/ui/Encabezado'
import { Cargando, Vacio } from '../../shared/ui/Estados'
import { EtiquetaAlerta, EtiquetaEstado } from '../../shared/ui/Etiquetas'
import { fechaCorta, fechaLarga, formatoNota, formatoPlaca, hoyIso, nombreCompleto } from '../../shared/util/formato'
import { BotonAvisoWhatsApp } from '../whatsapp/BotonAvisoWhatsApp'
import {
  listarListosParaRecoger,
  listarProximasEntregas,
  obtenerResumen,
  type PedidoConAlerta,
} from './inicio.api'

const cliente = (pedido: PedidoConAlerta) =>
  nombreCompleto({ nombre: pedido.clienteNombre, apellidos: pedido.clienteApellidos })

function cuandoEntrega(dias: number) {
  if (dias < 0) return `Retrasado ${-dias} ${dias === -1 ? 'día' : 'días'}`
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Mañana'
  return `En ${dias} días`
}

function Pedido({ pedido }: { pedido: PedidoConAlerta }) {
  return (
    <Link to={`/pedidos/${pedido.idPedido}`} className="inicio-pedido">
      <span className="mono fuerte">{formatoNota(pedido.numeroNota)}</span>
      <span>
        <span className="fuerte">{cliente(pedido)}</span>
        <span className="texto-suave">
          {' '}
          · {pedido.marca} {pedido.modelo} <span className="mono">{formatoPlaca(pedido.placas)}</span>
        </span>
      </span>
    </Link>
  )
}

export function InicioPage() {
  // Se monta de nuevo cada vez que se entra a Inicio, así las cifras siempre son las del momento.
  const { datos, error, cargando } = useRecurso(async () => {
    const [resumen, proximas, listos] = await Promise.all([
      obtenerResumen(),
      listarProximasEntregas(),
      listarListosParaRecoger(),
    ])
    return { resumen, proximas, listos }
  }, [])

  if (cargando && !datos) return <Cargando />
  if (!datos) return <Banner tipo="error">{error}</Banner>

  const { resumen, proximas, listos } = datos
  const tarjetas = [
    { texto: 'Pedidos activos', valor: resumen.pedidosActivos, ruta: '/pedidos', clase: '' },
    {
      texto: 'Entregas próximas',
      valor: resumen.entregasProximas,
      ruta: '/pedidos?alerta=ENTREGA_PROXIMA',
      clase: 'resumen-advertencia',
    },
    {
      texto: 'Listos para recoger',
      valor: resumen.listosParaRecoger,
      ruta: '/pedidos?alerta=DEBE_RECOGER',
      clase: 'resumen-exito',
    },
    { texto: 'Retrasados', valor: resumen.retrasados, ruta: '/pedidos?alerta=RETRASADO', clase: 'resumen-error' },
  ]

  return (
    <div className="pagina">
      <Encabezado titulo="Inicio" subtitulo={`Hoy, ${fechaLarga(hoyIso())}`} />

      <div className="rejilla-4">
        {tarjetas.map((tarjeta) => (
          <Link key={tarjeta.texto} to={tarjeta.ruta} className={`tarjeta resumen ${tarjeta.clase}`}>
            <span className="resumen-valor">{tarjeta.valor}</span>
            <span>{tarjeta.texto}</span>
          </Link>
        ))}
      </div>

      <div className="rejilla-2">
        <section className="tarjeta pila">
          <div className="fila-seccion">
            <h2 className="titulo-seccion">Próximas entregas</h2>
            <Link to="/pedidos">Ver todos ›</Link>
          </div>
          {proximas.length === 0 ? (
            <Vacio>No hay pedidos en curso.</Vacio>
          ) : (
            <ul className="inicio-lista">
              {proximas.map((pedido) => (
                <li key={pedido.idPedido} className={pedido.alerta === 'RETRASADO' ? 'retrasado' : undefined}>
                  <Pedido pedido={pedido} />
                  <span className="inicio-lista-lado">
                    {pedido.alerta ? (
                      <EtiquetaAlerta alerta={pedido.alerta} texto={cuandoEntrega(pedido.diasParaEntrega)} />
                    ) : (
                      <span className="texto-suave">
                        {cuandoEntrega(pedido.diasParaEntrega)} · {fechaCorta(pedido.fechaEstimadaEntrega)}
                      </span>
                    )}
                    <EtiquetaEstado estado={pedido.estado} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="tarjeta pila">
          <div className="fila-seccion">
            <h2 className="titulo-seccion">Listos para recoger</h2>
            <Link to="/pedidos?alerta=DEBE_RECOGER">Ver todos ›</Link>
          </div>
          {listos.length === 0 ? (
            <Vacio>No hay vehículos esperando a su dueño.</Vacio>
          ) : (
            <ul className="inicio-lista">
              {listos.map((pedido) => (
                <li key={pedido.idPedido}>
                  <Pedido pedido={pedido} />
                  <BotonAvisoWhatsApp
                    cliente={{ nombre: pedido.clienteNombre, telefono: pedido.clienteTelefono }}
                    vehiculo={pedido}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
