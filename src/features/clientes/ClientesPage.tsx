import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRecurso, useValorRetrasado } from '../../shared/api/useRecurso'
import { Banner } from '../../shared/ui/Banner'
import { Boton } from '../../shared/ui/Boton'
import { Buscador } from '../../shared/ui/Campo'
import { Encabezado } from '../../shared/ui/Encabezado'
import { Cargando } from '../../shared/ui/Estados'
import { MenuFila } from '../../shared/ui/MenuFila'
import { Confirmacion } from '../../shared/ui/Modal'
import { Paginacion, Tabla, type Columna } from '../../shared/ui/Tabla'
import { fechaLarga, formatoTelefono, nombreCompleto } from '../../shared/util/formato'
import { eliminarCliente, listarClientes, type Cliente } from './clientes.api'
import { ClienteModal } from './components/ClienteModal'
import { NuevoClienteVehiculoModal } from './components/NuevoClienteVehiculoModal'

export function ClientesPage() {
  const navegar = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina] = useState(1)
  const [creando, setCreando] = useState(false)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [eliminando, setEliminando] = useState<Cliente | null>(null)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const q = useValorRetrasado(busqueda.trim())

  const { datos, error, cargando, recargar } = useRecurso(() => listarClientes({ q, pagina }), [q, pagina])

  function cambiarBusqueda(valor: string) {
    setBusqueda(valor)
    setPagina(1)
  }

  const columnas = useMemo<Columna<Cliente>[]>(
    () => [
      {
        encabezado: 'Nombre',
        celda: (cliente) => (
          <Link to={`/clientes/${cliente.id}`} className="fuerte">
            {nombreCompleto(cliente)}
          </Link>
        ),
        orden: (cliente) => nombreCompleto(cliente),
      },
      { encabezado: 'Teléfono', celda: (cliente) => formatoTelefono(cliente.telefono) },
      { encabezado: 'Vehículos', celda: (cliente) => cliente.vehiculos, orden: (cliente) => cliente.vehiculos },
      {
        encabezado: 'Pedidos activos',
        celda: (cliente) => cliente.pedidosActivos,
        orden: (cliente) => cliente.pedidosActivos,
      },
      {
        encabezado: 'Última visita',
        celda: (cliente) => fechaLarga(cliente.ultimaVisita),
        orden: (cliente) => cliente.ultimaVisita,
      },
    ],
    [],
  )

  async function confirmarEliminar() {
    if (!eliminando) return
    try {
      await eliminarCliente(eliminando.id)
      setAviso(`Cliente ${nombreCompleto(eliminando)} eliminado.`)
      setEliminando(null)
      void recargar()
    } catch (causa) {
      setErrorEliminar((causa as Error).message)
    }
  }

  return (
    <div className="pagina">
      <Encabezado
        titulo="Clientes"
        acciones={
          <Boton variante="principal" onClick={() => setCreando(true)}>
            + Nuevo cliente
          </Boton>
        }
      />

      <div className="fila-controles">
        <Buscador valor={busqueda} alCambiar={cambiarBusqueda} placeholder="Buscar por nombre, teléfono o placa" />
      </div>

      {aviso && <Banner tipo="exito">{aviso}</Banner>}
      {error && <Banner tipo="error">{error}</Banner>}
      {cargando && !datos && <Cargando />}
      {datos && (
        <>
          <Tabla
            columnas={columnas}
            filas={datos.datos}
            claveDe={(cliente) => cliente.id}
            vacio="No hay clientes que coincidan con la búsqueda."
            menu={(cliente) => (
              <MenuFila
                etiqueta={`Acciones de ${nombreCompleto(cliente)}`}
                opciones={[
                  { etiqueta: 'Ver detalle', alElegir: () => navegar(`/clientes/${cliente.id}`) },
                  { etiqueta: 'Editar', alElegir: () => setEditando(cliente) },
                  {
                    etiqueta: 'Eliminar',
                    destructiva: true,
                    deshabilitada: !cliente.puedeEliminar,
                    ayuda: 'Tiene pedidos; se conserva su historial.',
                    alElegir: () => {
                      setErrorEliminar(null)
                      setEliminando(cliente)
                    },
                  },
                ]}
              />
            )}
          />
          <Paginacion
            pagina={datos.pagina}
            limite={datos.limite}
            total={datos.total}
            alCambiar={setPagina}
            sustantivo="clientes"
          />
        </>
      )}

      {creando && (
        <NuevoClienteVehiculoModal
          alCerrar={() => setCreando(false)}
          alGuardar={({ cliente }) => {
            setCreando(false)
            navegar(`/clientes/${cliente.id}`)
          }}
        />
      )}
      {editando && (
        <ClienteModal
          cliente={editando}
          alCerrar={() => setEditando(null)}
          alGuardar={(cliente) => {
            setEditando(null)
            setAviso(`Cliente ${nombreCompleto(cliente)} actualizado.`)
            void recargar()
          }}
        />
      )}
      {eliminando && (
        <Confirmacion
          titulo="Eliminar cliente"
          mensaje={`¿Eliminar a ${nombreCompleto(eliminando)} y sus vehículos? Esta acción no se puede deshacer.`}
          etiquetaConfirmar="Eliminar cliente"
          error={errorEliminar}
          alConfirmar={confirmarEliminar}
          alCancelar={() => setEliminando(null)}
        />
      )}
    </div>
  )
}
