import { useState } from 'react'
import { Autocompletar } from './Autocompletar'
import { Banner } from './Banner'
import { Boton } from './Boton'
import { Buscador, CampoArea, CampoTexto } from './Campo'
import { Encabezado } from './Encabezado'
import { EtiquetaAlerta, EtiquetaEstado } from './Etiquetas'
import { MenuFila } from './MenuFila'
import { Confirmacion, Modal } from './Modal'
import { Paginacion, Tabla, type Columna } from './Tabla'

interface FilaMuestra {
  nota: string
  cliente: string
}

const FILAS: FilaMuestra[] = [
  { nota: '0048', cliente: 'Cliente de ejemplo A' },
  { nota: '0047', cliente: 'Cliente de ejemplo B' },
]

const COLUMNAS: Columna<FilaMuestra>[] = [
  { encabezado: 'Nota', celda: (fila) => <span className="mono">{fila.nota}</span>, orden: (fila) => fila.nota },
  { encabezado: 'Cliente', celda: (fila) => fila.cliente, orden: (fila) => fila.cliente },
]

const OPCIONES = ['Primera opción', 'Segunda opción', 'Tercera opción']

// Referencia para el equipo: todos los componentes del kit en una sola página (/muestra-ui).
export function MuestraUiPage() {
  const [modal, setModal] = useState(false)
  const [confirmacion, setConfirmacion] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const [texto, setTexto] = useState('')
  const [pagina, setPagina] = useState(1)

  return (
    <div className="pagina">
      <Encabezado titulo="Kit de componentes" subtitulo="Referencia para el equipo" />

      <section className="pila">
        <h2 className="titulo-seccion">Botones</h2>
        <div className="fila-controles">
          <Boton variante="principal">Principal</Boton>
          <Boton>Secundario</Boton>
          <Boton variante="destructivo">Destructivo</Boton>
          <Boton variante="principal" disabled>
            Deshabilitado
          </Boton>
        </div>
      </section>

      <section className="pila">
        <h2 className="titulo-seccion">Estados y alertas</h2>
        <div className="fila-controles">
          <EtiquetaEstado estado="RECIBIDO" />
          <EtiquetaEstado estado="EN_SERVICIO" />
          <EtiquetaEstado estado="LISTO" />
          <EtiquetaEstado estado="ENTREGADO" />
        </div>
        <div className="fila-controles">
          <EtiquetaAlerta alerta="ENTREGA_PROXIMA" />
          <EtiquetaAlerta alerta="RETRASADO" />
          <EtiquetaAlerta alerta="DEBE_RECOGER" />
        </div>
      </section>

      <section className="pila">
        <h2 className="titulo-seccion">Banners</h2>
        <Banner tipo="informacion">Registra la placa del vehículo antes de crear la orden.</Banner>
        <Banner tipo="exito">Orden guardada correctamente.</Banner>
        <Banner tipo="advertencia">La orden está en espera.</Banner>
        <Banner tipo="error">Faltan datos del cliente.</Banner>
      </section>

      <section className="pila">
        <h2 className="titulo-seccion">Formularios</h2>
        <div className="rejilla-2">
          <CampoTexto etiqueta="Campo de texto" obligatorio />
          <CampoTexto etiqueta="Con error" error="Este dato es obligatorio." />
          <CampoTexto etiqueta="Placa" mono defaultValue="ABC-123" />
          <CampoArea etiqueta="Área de texto" />
          <Autocompletar
            etiqueta="Autocompletar"
            texto={texto}
            alCambiarTexto={setTexto}
            buscar={async (consulta) => OPCIONES.filter((opcion) => opcion.toLowerCase().includes(consulta.toLowerCase()))}
            alElegir={setTexto}
            claveDe={(opcion) => opcion}
            mostrar={(opcion) => opcion}
          />
          <div className="campo">
            <label>Buscador</label>
            <Buscador valor={busqueda} alCambiar={setBusqueda} placeholder="Buscar por nombre o placa" />
          </div>
        </div>
      </section>

      <section className="pila">
        <h2 className="titulo-seccion">Tabla con orden, menú y paginación</h2>
        <Tabla
          columnas={COLUMNAS}
          filas={FILAS}
          claveDe={(fila) => fila.nota}
          menu={(fila) => (
            <MenuFila
              etiqueta={`Acciones de la nota ${fila.nota}`}
              opciones={[
                { etiqueta: 'Ver detalle', alElegir: () => {} },
                { etiqueta: 'Eliminar', destructiva: true, alElegir: () => setConfirmacion(true) },
                { etiqueta: 'Deshabilitada', deshabilitada: true, ayuda: 'Explica el motivo.', alElegir: () => {} },
              ]}
            />
          )}
        />
        <Paginacion pagina={pagina} limite={20} total={45} alCambiar={setPagina} sustantivo="registros" />
      </section>

      <section className="pila">
        <h2 className="titulo-seccion">Ventanas</h2>
        <div className="fila-controles">
          <Boton onClick={() => setModal(true)}>Abrir modal</Boton>
          <Boton variante="destructivo" onClick={() => setConfirmacion(true)}>
            Abrir confirmación
          </Boton>
        </div>
      </section>

      {modal && (
        <Modal
          titulo="Modal de ejemplo"
          alCerrar={() => setModal(false)}
          pie={<Boton onClick={() => setModal(false)}>Cerrar</Boton>}
        >
          <CampoTexto etiqueta="Dato" />
        </Modal>
      )}
      {confirmacion && (
        <Confirmacion
          titulo="Confirmar"
          mensaje="Esta acción no se puede deshacer."
          etiquetaConfirmar="Eliminar"
          alConfirmar={() => setConfirmacion(false)}
          alCancelar={() => setConfirmacion(false)}
        />
      )}
    </div>
  )
}
