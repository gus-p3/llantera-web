import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecurso, useValorRetrasado } from '../../shared/api/useRecurso'
import { Banner } from '../../shared/ui/Banner'
import { Boton } from '../../shared/ui/Boton'
import { Buscador } from '../../shared/ui/Campo'
import { Encabezado } from '../../shared/ui/Encabezado'
import { Cargando } from '../../shared/ui/Estados'
import { MenuFila } from '../../shared/ui/MenuFila'
import { Paginacion, Tabla, type Columna } from '../../shared/ui/Tabla'
import { fechaLarga, formatoPlaca, nombreCompleto } from '../../shared/util/formato'
import { listarMarcas } from '../marcas/marcas.api'
import { listarVehiculos, type Vehiculo } from './vehiculos.api'

export function VehiculosPage() {
  const navegar = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [idMarca, setIdMarca] = useState('')
  const [pagina, setPagina] = useState(1)
  const q = useValorRetrasado(busqueda.trim())

  const { datos: marcas } = useRecurso(() => listarMarcas(), [])
  const { datos, error, cargando } = useRecurso(
    () => listarVehiculos({ q, pagina, idMarca: idMarca ? Number(idMarca) : undefined }),
    [q, idMarca, pagina],
  )

  function cambiarFiltros(cambios: { busqueda?: string; idMarca?: string }) {
    if (cambios.busqueda !== undefined) setBusqueda(cambios.busqueda)
    if (cambios.idMarca !== undefined) setIdMarca(cambios.idMarca)
    setPagina(1)
  }

  const columnas = useMemo<Columna<Vehiculo>[]>(
    () => [
      {
        encabezado: 'Placa',
        celda: (vehiculo) => <span className="mono">{formatoPlaca(vehiculo.placas)}</span>,
        orden: (vehiculo) => vehiculo.placas,
      },
      {
        encabezado: 'Marca y modelo',
        celda: (vehiculo) => (
          <Link to={`/vehiculos/${vehiculo.id}`} className="fuerte">
            {vehiculo.marca.nombre} {vehiculo.modelo}
          </Link>
        ),
        orden: (vehiculo) => `${vehiculo.marca.nombre} ${vehiculo.modelo}`,
      },
      { encabezado: 'Año', celda: (vehiculo) => vehiculo.anio ?? '—', orden: (vehiculo) => vehiculo.anio },
      { encabezado: 'Color', celda: (vehiculo) => vehiculo.color ?? '—' },
      {
        encabezado: 'Dueño',
        celda: (vehiculo) => nombreCompleto(vehiculo.dueno),
        orden: (vehiculo) => nombreCompleto(vehiculo.dueno),
      },
      {
        encabezado: 'Último servicio',
        celda: (vehiculo) => fechaLarga(vehiculo.ultimoServicio),
        orden: (vehiculo) => vehiculo.ultimoServicio,
      },
    ],
    [],
  )

  return (
    <div className="pagina">
      <Encabezado titulo="Vehículos" />

      <div className="fila-controles">
        <Buscador
          valor={busqueda}
          alCambiar={(valor) => cambiarFiltros({ busqueda: valor })}
          placeholder="Placa, marca, modelo o dueño"
        />
        <select
          className="entrada selector"
          aria-label="Filtrar por marca"
          value={idMarca}
          onChange={(evento) => cambiarFiltros({ idMarca: evento.target.value })}
        >
          <option value="">Marca</option>
          {marcas?.map((marca) => (
            <option key={marca.id} value={marca.id}>
              {marca.nombre}
            </option>
          ))}
        </select>
        <Boton onClick={() => cambiarFiltros({ busqueda: '', idMarca: '' })}>Limpiar filtros</Boton>
      </div>

      {error && <Banner tipo="error">{error}</Banner>}
      {cargando && !datos && <Cargando />}
      {datos && (
        <>
          <Tabla
            columnas={columnas}
            filas={datos.datos}
            claveDe={(vehiculo) => vehiculo.id}
            vacio="No hay vehículos que coincidan con la búsqueda."
            menu={(vehiculo) => (
              <MenuFila
                etiqueta={`Acciones de ${formatoPlaca(vehiculo.placas)}`}
                opciones={[{ etiqueta: 'Ver detalle', alElegir: () => navegar(`/vehiculos/${vehiculo.id}`) }]}
              />
            )}
          />
          <Paginacion
            pagina={datos.pagina}
            limite={datos.limite}
            total={datos.total}
            alCambiar={setPagina}
            sustantivo="vehículos"
          />
        </>
      )}

      <Banner>Los vehículos se agregan desde la ficha de cada cliente; aquí se consultan todos juntos.</Banner>
    </div>
  )
}
