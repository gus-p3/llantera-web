import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useRecurso } from '../../shared/api/useRecurso'
import { Banner } from '../../shared/ui/Banner'
import { Boton } from '../../shared/ui/Boton'
import { Encabezado } from '../../shared/ui/Encabezado'
import { Cargando } from '../../shared/ui/Estados'
import { formatoPlaca, formatoTelefono, nombreCompleto } from '../../shared/util/formato'
import { HistorialTabla } from './components/HistorialTabla'
import { VehiculoModal } from './components/VehiculoModal'
import { obtenerHistorial, obtenerVehiculo } from './vehiculos.api'

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string | number | null }) {
  return (
    <div>
      <div className="dato-etiqueta">{etiqueta}</div>
      <div className="dato-valor">{valor ?? '—'}</div>
    </div>
  )
}

export function VehiculoDetallePage() {
  const id = Number(useParams().id)
  const [editando, setEditando] = useState(false)
  const { datos, error, cargando, recargar } = useRecurso(
    async () => {
      const [vehiculo, historial] = await Promise.all([obtenerVehiculo(id), obtenerHistorial(id)])
      return { vehiculo, historial }
    },
    [id],
  )

  if (cargando && !datos) return <Cargando />
  if (!datos) return <Banner tipo="error">{error}</Banner>

  const { vehiculo, historial } = datos
  const placa = formatoPlaca(vehiculo.placas)

  return (
    <div className="pagina">
      <Encabezado
        migas={[{ etiqueta: 'Vehículos', ruta: '/vehiculos' }, { etiqueta: placa }]}
        titulo={<span className="mono">{placa}</span>}
        subtitulo={`${vehiculo.marca.nombre} ${vehiculo.modelo}${vehiculo.anio ? ` ${vehiculo.anio}` : ''}`}
        acciones={<Boton onClick={() => setEditando(true)}>Editar vehículo</Boton>}
      />

      {error && <Banner tipo="error">{error}</Banner>}

      <div className="rejilla-2">
        <section className="tarjeta pila">
          <h2 className="titulo-seccion">Datos del vehículo</h2>
          <div className="rejilla-2">
            <Dato etiqueta="Marca" valor={vehiculo.marca.nombre} />
            <Dato etiqueta="Modelo" valor={vehiculo.modelo} />
            <Dato etiqueta="Año" valor={vehiculo.anio} />
            <Dato etiqueta="Color" valor={vehiculo.color} />
          </div>
          {vehiculo.notas && <p className="texto-suave">Notas: {vehiculo.notas}</p>}
        </section>

        <section className="tarjeta pila">
          <div className="fila-seccion">
            <h2 className="titulo-seccion">Dueño del vehículo</h2>
            <Link to={`/clientes/${vehiculo.dueno.id}`}>Ver cliente ›</Link>
          </div>
          <div className="dato-valor">{nombreCompleto(vehiculo.dueno)}</div>
          <p className="texto-suave">Tel. {formatoTelefono(vehiculo.dueno.telefono)}</p>
          <p className="texto-suave">Otros vehículos del cliente: {vehiculo.otrosVehiculosDelCliente}</p>
        </section>
      </div>

      <div className="fila-seccion">
        <h2 className="titulo-seccion">Historial de servicios</h2>
        <span className="texto-suave">Del más reciente al más antiguo</span>
      </div>
      <HistorialTabla pedidos={historial} />

      {editando && (
        <VehiculoModal
          vehiculo={vehiculo}
          alCerrar={() => setEditando(false)}
          alGuardar={() => {
            setEditando(false)
            void recargar()
          }}
        />
      )}
    </div>
  )
}
