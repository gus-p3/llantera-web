import { useState } from 'react'
import type { ErrorHttp, ErroresDeCampo } from '../../shared/api/http'
import { useRecurso } from '../../shared/api/useRecurso'
import { Banner } from '../../shared/ui/Banner'
import { Boton } from '../../shared/ui/Boton'
import { CampoArea, CampoTexto } from '../../shared/ui/Campo'
import { Encabezado } from '../../shared/ui/Encabezado'
import { Cargando } from '../../shared/ui/Estados'
import { Confirmacion } from '../../shared/ui/Modal'
import { formatoTelefono, nombreCompleto } from '../../shared/util/formato'
import { enlaceWhatsApp } from '../whatsapp/whatsapp'
import {
  actualizarPromocion,
  crearPromocion,
  eliminarPromocion,
  listarContactos,
  listarPromociones,
  type Contacto,
  type Promocion,
} from './promociones.api'

interface Envio {
  mensaje: string
  contactos: Contacto[]
  enviados: number
}

// El envío a medias se guarda en la pestaña para retomarlo si se cambia de pantalla.
const CLAVE_ENVIO = 'taller.envio-promocion'

function leerEnvio(): Envio | null {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_ENVIO) ?? 'null') as Envio | null
  } catch {
    return null
  }
}

function guardarEnvio(envio: Envio | null) {
  try {
    if (envio) sessionStorage.setItem(CLAVE_ENVIO, JSON.stringify(envio))
    else sessionStorage.removeItem(CLAVE_ENVIO)
  } catch {
    // Sin almacenamiento el envío sigue funcionando; solo no se puede retomar.
  }
}

export function PromocionesPage() {
  const { datos, error, cargando, recargar } = useRecurso(async () => {
    const [promociones, contactos] = await Promise.all([listarPromociones(), listarContactos()])
    return { promociones, contactos }
  }, [])

  const [elegidos, setElegidos] = useState<Set<number>>(new Set())
  const [actual, setActual] = useState<Promocion | null>(null)
  const [titulo, setTitulo] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [errores, setErrores] = useState<ErroresDeCampo>({})
  const [aviso, setAviso] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null)
  const [borrando, setBorrando] = useState(false)
  const [envio, setEnvioEstado] = useState<Envio | null>(leerEnvio)

  const setEnvio = (siguiente: Envio | null) => {
    guardarEnvio(siguiente)
    setEnvioEstado(siguiente)
  }

  if (cargando && !datos) return <Cargando />
  if (!datos) return <Banner tipo="error">{error}</Banner>
  const { promociones, contactos } = datos

  function abrir(promocion: Promocion | null) {
    setActual(promocion)
    setTitulo(promocion?.titulo ?? '')
    setMensaje(promocion?.mensaje ?? '')
    setErrores({})
    setAviso(null)
  }

  function alternar(id: number) {
    setElegidos((previos) => {
      const siguientes = new Set(previos)
      if (!siguientes.delete(id)) siguientes.add(id)
      return siguientes
    })
  }

  async function guardar() {
    setErrores({})
    try {
      const datosPromocion = { titulo, mensaje }
      const guardada = actual
        ? await actualizarPromocion(actual.id, datosPromocion)
        : await crearPromocion(datosPromocion)
      setActual(guardada)
      setAviso({ tipo: 'exito', texto: 'Mensaje guardado correctamente.' })
      await recargar()
    } catch (causa) {
      const fallo = causa as ErrorHttp
      if (Object.keys(fallo.campos ?? {}).length > 0) setErrores(fallo.campos)
      else setAviso({ tipo: 'error', texto: fallo.message })
    }
  }

  async function borrar() {
    if (!actual) return
    try {
      await eliminarPromocion(actual.id)
      setBorrando(false)
      abrir(null)
      await recargar()
    } catch (causa) {
      setBorrando(false)
      setAviso({ tipo: 'error', texto: (causa as Error).message })
    }
  }

  function prepararEnvio() {
    const encontrados: ErroresDeCampo = {}
    if (!mensaje.trim()) encontrados.mensaje = 'Escribe el mensaje de la promoción.'
    setErrores(encontrados)
    if (encontrados.mensaje) return
    if (elegidos.size === 0) {
      setAviso({ tipo: 'error', texto: 'Marca al menos un contacto.' })
      return
    }
    setEnvio({ mensaje: mensaje.trim(), contactos: contactos.filter((c) => elegidos.has(c.id)), enviados: 0 })
  }

  if (envio) {
    const total = envio.contactos.length
    const siguiente = envio.contactos[envio.enviados]
    return (
      <div className="pagina">
        <Encabezado
          migas={[{ etiqueta: 'Promociones', ruta: '/promociones' }, { etiqueta: 'Envío guiado' }]}
          titulo="Envío guiado"
          subtitulo={`${envio.enviados} de ${total} enviados`}
        />
        <progress className="progreso" max={total} value={envio.enviados} aria-label="Avance del envío" />
        <section className="tarjeta pila">
          <div className="dato-etiqueta">Mensaje</div>
          <p className="mensaje-promocion">{envio.mensaje}</p>
        </section>
        {siguiente ? (
          <section className="tarjeta pila">
            <div className="dato-etiqueta">
              Contacto {envio.enviados + 1} de {total}
            </div>
            <div className="dato-valor">{nombreCompleto(siguiente)}</div>
            <p className="texto-suave">Tel. {formatoTelefono(siguiente.telefono)}</p>
            <div className="fila-controles">
              <a
                className="boton boton-principal"
                href={enlaceWhatsApp(siguiente.telefono, envio.mensaje)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir en WhatsApp con el mensaje
              </a>
              <Boton onClick={() => setEnvio({ ...envio, enviados: envio.enviados + 1 })}>Marcar como enviado</Boton>
            </div>
          </section>
        ) : (
          <Banner tipo="exito">Listo: se prepararon los {total} mensajes.</Banner>
        )}
        <div className="fila-controles">
          <Boton onClick={() => setEnvio(null)}>{siguiente ? 'Cancelar envío' : 'Terminar'}</Boton>
        </div>
        <Banner>Nada se envía solo: cada mensaje lo manda la secretaria desde su WhatsApp.</Banner>
      </div>
    )
  }

  const todos = contactos.length > 0 && elegidos.size === contactos.length

  return (
    <div className="pagina">
      <Encabezado titulo="Promociones" />
      {aviso && <Banner tipo={aviso.tipo}>{aviso.texto}</Banner>}

      <div className="rejilla-2">
        <section className="tarjeta pila">
          <div className="fila-seccion">
            <h2 className="titulo-seccion">Contactos</h2>
            <span className="texto-suave">{elegidos.size} seleccionados</span>
          </div>
          <label className="casilla fuerte">
            <input
              type="checkbox"
              checked={todos}
              onChange={() => setElegidos(todos ? new Set() : new Set(contactos.map((c) => c.id)))}
            />
            Seleccionar todos ({contactos.length})
          </label>
          <ul className="lista-contactos">
            {contactos.map((contacto) => (
              <li key={contacto.id}>
                <label className="casilla">
                  <input type="checkbox" checked={elegidos.has(contacto.id)} onChange={() => alternar(contacto.id)} />
                  <span>{nombreCompleto(contacto)}</span>
                  <span className="texto-suave">{formatoTelefono(contacto.telefono)}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="tarjeta pila">
          <div className="fila-seccion">
            <h2 className="titulo-seccion">Mensaje</h2>
            <select
              className="entrada selector"
              aria-label="Mensajes guardados"
              value={actual?.id ?? ''}
              onChange={(evento) =>
                abrir(promociones.find((promocion) => promocion.id === Number(evento.target.value)) ?? null)
              }
            >
              <option value="">Mensaje nuevo</option>
              {promociones.map((promocion) => (
                <option key={promocion.id} value={promocion.id}>
                  {promocion.titulo}
                </option>
              ))}
            </select>
          </div>
          <CampoTexto
            etiqueta="Título"
            obligatorio
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            error={errores.titulo}
          />
          <CampoArea
            etiqueta="Texto del mensaje"
            obligatorio
            rows={6}
            value={mensaje}
            onChange={(evento) => setMensaje(evento.target.value)}
            error={errores.mensaje}
          />
          <div className="acciones-formulario">
            {actual && (
              <Boton variante="destructivo" onClick={() => setBorrando(true)}>
                Borrar
              </Boton>
            )}
            <Boton onClick={() => void guardar()}>Guardar mensaje</Boton>
            <Boton variante="principal" onClick={prepararEnvio}>
              Preparar envío
            </Boton>
          </div>
        </section>
      </div>

      {borrando && actual && (
        <Confirmacion
          titulo="Borrar mensaje"
          mensaje={`¿Borrar el mensaje «${actual.titulo}»? Esta acción no se puede deshacer.`}
          etiquetaConfirmar="Borrar"
          alConfirmar={() => void borrar()}
          alCancelar={() => setBorrando(false)}
        />
      )}
    </div>
  )
}
