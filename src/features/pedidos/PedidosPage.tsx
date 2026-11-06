import { useMemo } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useRecurso, useValorRetrasado } from '../../shared/api/useRecurso'
import { Banner } from '../../shared/ui/Banner'
import { Boton } from '../../shared/ui/Boton'
import { Buscador, CampoTexto } from '../../shared/ui/Campo'
import { Encabezado } from '../../shared/ui/Encabezado'
import { Cargando } from '../../shared/ui/Estados'
import { EtiquetaAlerta, EtiquetaEstado } from '../../shared/ui/Etiquetas'
import { MenuFila } from '../../shared/ui/MenuFila'
import { Paginacion, Tabla, type Columna } from '../../shared/ui/Tabla'
import { fechaLarga, formatoNota, formatoPlaca, nombreCompleto } from '../../shared/util/formato'
import { listarMarcas } from '../marcas/marcas.api'
import { FILTROS_PEDIDOS, listarPedidos, type FiltrosPedidos, type PedidoResumen } from './pedidos.api'

export function PedidosPage() {
  const navegar = useNavigate()
  const aviso = (useLocation().state as { aviso?: string } | null)?.aviso
  const [parametros, setParametros] = useSearchParams()

  // Los filtros viven en la URL para compartirlos y para que Inicio llegue con ellos puestos.
  const filtros = Object.fromEntries(
    FILTROS_PEDIDOS.map((clave) => [clave, parametros.get(clave) ?? '']),
  ) as Required<FiltrosPedidos>
  const entregados = filtros.entregados === 'true'
  const q = useValorRetrasado(filtros.q.trim())
  const modelo = useValorRetrasado(filtros.modelo.trim())

  function cambiar(cambios: FiltrosPedidos) {
    const siguientes = new URLSearchParams(parametros)
    for (const [clave, valor] of Object.entries({ pagina: '', ...cambios })) {
      if (valor) siguientes.set(clave, valor)
      else siguientes.delete(clave)
    }
    setParametros(siguientes, { replace: true })
  }

  const cambiarPestana = (aEntregados: boolean) =>
    setParametros(aEntregados ? { entregados: 'true' } : {}, { replace: true })

  const { datos: marcas } = useRecurso(() => listarMarcas(), [])
  const consulta = { ...filtros, q, modelo, entregados: entregados ? 'true' : 'false' }
  const { datos, error, cargando } = useRecurso(() => listarPedidos(consulta), [consulta])

  const columnas = useMemo<Columna<PedidoResumen>[]>(
    () => [
      {
        encabezado: 'Nota',
        celda: (pedido) => (
          <Link to={`/pedidos/${pedido.id}`} className="mono fuerte">
            {formatoNota(pedido.numeroNota)}
          </Link>
        ),
        orden: (pedido) => pedido.numeroNota,
      },
      {
        encabezado: 'Cliente',
        celda: (pedido) => nombreCompleto(pedido.cliente),
        orden: (pedido) => nombreCompleto(pedido.cliente),
      },
      {
        encabezado: 'Vehículo',
        celda: (pedido) => (
          <>
            {pedido.vehiculo.marca} {pedido.vehiculo.modelo}{' '}
            <span className="mono texto-suave">{formatoPlaca(pedido.vehiculo.placas)}</span>
          </>
        ),
      },
      { encabezado: 'Ingreso', celda: (pedido) => fechaLarga(pedido.fechaIngreso), orden: (p) => p.fechaIngreso },
      entregados
        ? { encabezado: 'Salida', celda: (pedido) => fechaLarga(pedido.fechaSalida), orden: (p) => p.fechaSalida }
        : {
            encabezado: 'Entrega estimada',
            celda: (pedido) => fechaLarga(pedido.fechaEstimadaEntrega),
            orden: (p) => p.fechaEstimadaEntrega,
          },
      { encabezado: 'Estado', celda: (pedido) => <EtiquetaEstado estado={pedido.estado.clave} /> },
      {
        encabezado: 'Alerta',
        celda: (pedido) =>
          pedido.alerta ? <EtiquetaAlerta alerta={pedido.alerta} /> : <span className="texto-suave">—</span>,
      },
    ],
    [entregados],
  )

  return (
    <div className="pagina">
      <Encabezado
        titulo="Pedidos"
        acciones={
          <Boton variante="principal" onClick={() => navegar('/pedidos/nuevo')}>
            + Nuevo pedido
          </Boton>
        }
      />

      {aviso && <Banner tipo="exito">{aviso}</Banner>}

      <div className="pestanas" role="tablist" aria-label="Tipo de pedidos">
        <button type="button" role="tab" aria-selected={!entregados} onClick={() => cambiarPestana(false)}>
          Activos
        </button>
        <button type="button" role="tab" aria-selected={entregados} onClick={() => cambiarPestana(true)}>
          Entregados
        </button>
      </div>

      <div className="fila-controles">
        <Buscador
          valor={filtros.q}
          alCambiar={(valor) => cambiar({ q: valor })}
          placeholder="Placa, cliente o número de nota"
        />
        <select
          className="entrada selector"
          aria-label="Filtrar por marca"
          value={filtros.idMarca}
          onChange={(evento) => cambiar({ idMarca: evento.target.value })}
        >
          <option value="">Marca</option>
          {marcas?.map((marca) => (
            <option key={marca.id} value={marca.id}>
              {marca.nombre}
            </option>
          ))}
        </select>
        <input
          className="entrada selector"
          aria-label="Filtrar por modelo"
          placeholder="Modelo"
          value={filtros.modelo}
          onChange={(evento) => cambiar({ modelo: evento.target.value })}
        />
        {!entregados && (
          <>
            <select
              className="entrada selector"
              aria-label="Filtrar por estado"
              value={filtros.estado}
              onChange={(evento) => cambiar({ estado: evento.target.value })}
            >
              <option value="">Estado</option>
              <option value="RECIBIDO">Recibido</option>
              <option value="EN_SERVICIO">En servicio</option>
              <option value="LISTO">Listo</option>
            </select>
            <select
              className="entrada selector"
              aria-label="Filtrar por alerta"
              value={filtros.alerta}
              onChange={(evento) => cambiar({ alerta: evento.target.value })}
            >
              <option value="">Alerta</option>
              <option value="RETRASADO">Retrasado</option>
              <option value="ENTREGA_PROXIMA">Entrega próxima</option>
              <option value="DEBE_RECOGER">Debe recoger</option>
            </select>
          </>
        )}
      </div>

      <div className="fila-controles">
        <CampoTexto
          etiqueta="Ingreso desde"
          type="date"
          value={filtros.ingresoDesde}
          onChange={(evento) => cambiar({ ingresoDesde: evento.target.value })}
        />
        <CampoTexto
          etiqueta="Ingreso hasta"
          type="date"
          value={filtros.ingresoHasta}
          onChange={(evento) => cambiar({ ingresoHasta: evento.target.value })}
        />
        {entregados && (
          <>
            <CampoTexto
              etiqueta="Salida desde"
              type="date"
              value={filtros.salidaDesde}
              onChange={(evento) => cambiar({ salidaDesde: evento.target.value })}
            />
            <CampoTexto
              etiqueta="Salida hasta"
              type="date"
              value={filtros.salidaHasta}
              onChange={(evento) => cambiar({ salidaHasta: evento.target.value })}
            />
          </>
        )}
        <Boton onClick={() => cambiarPestana(entregados)}>Limpiar filtros</Boton>
      </div>

      {error && <Banner tipo="error">{error}</Banner>}
      {cargando && !datos && <Cargando />}
      {datos && (
        <>
          <Tabla
            columnas={columnas}
            filas={datos.datos}
            claveDe={(pedido) => pedido.id}
            vacio="No hay pedidos que coincidan con los filtros."
            menu={(pedido) => (
              <MenuFila
                etiqueta={`Acciones de la nota ${formatoNota(pedido.numeroNota)}`}
                opciones={[{ etiqueta: 'Ver detalle', alElegir: () => navegar(`/pedidos/${pedido.id}`) }]}
              />
            )}
          />
          <Paginacion
            pagina={datos.pagina}
            limite={datos.limite}
            total={datos.total}
            alCambiar={(pagina) => cambiar({ pagina: String(pagina) })}
            sustantivo="pedidos"
          />
        </>
      )}
    </div>
  )
}
