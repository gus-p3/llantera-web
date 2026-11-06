import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useValorRetrasado } from '../api/useRecurso'
import { ContenedorCampo } from './Campo'

interface Accion {
  etiqueta: string
  alElegir: () => void
}

interface Props<T> {
  etiqueta: string
  texto: string
  alCambiarTexto: (texto: string) => void
  buscar: (texto: string) => Promise<T[]>
  alElegir: (opcion: T) => void
  claveDe: (opcion: T) => string | number
  mostrar: (opcion: T) => ReactNode
  // Acción explícita al final de la lista, por ejemplo «Agregar como nuevo encargado».
  accion?: (texto: string, opciones: T[]) => Accion | null
  placeholder?: string
  error?: string
  obligatorio?: boolean
}

export function Autocompletar<T>({
  etiqueta,
  texto,
  alCambiarTexto,
  buscar,
  alElegir,
  claveDe,
  mostrar,
  accion,
  placeholder,
  error,
  obligatorio,
}: Props<T>) {
  const [abierto, setAbierto] = useState(false)
  const [opciones, setOpciones] = useState<T[]>([])
  const [activa, setActiva] = useState(-1)
  const textoBuscado = useValorRetrasado(texto, 200)
  const ultimaBusqueda = useRef(0)
  const buscarActual = useRef(buscar)
  const idLista = useId()

  useEffect(() => {
    buscarActual.current = buscar
  })

  useEffect(() => {
    if (!abierto) return
    const busqueda = ++ultimaBusqueda.current
    buscarActual
      .current(textoBuscado.trim())
      .then((resultado) => {
        if (busqueda === ultimaBusqueda.current) {
          setOpciones(resultado)
          setActiva(-1)
        }
      })
      .catch(() => {
        if (busqueda === ultimaBusqueda.current) setOpciones([])
      })
  }, [textoBuscado, abierto])

  const accionVisible = abierto ? (accion?.(texto.trim(), opciones) ?? null) : null
  const totalFilas = opciones.length + (accionVisible ? 1 : 0)

  function elegirFila(indice: number) {
    if (indice < opciones.length) alElegir(opciones[indice])
    else accionVisible?.alElegir()
    setAbierto(false)
  }

  function alPresionar(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault()
      setAbierto(true)
      if (totalFilas > 0) {
        const paso = evento.key === 'ArrowDown' ? 1 : -1
        setActiva((actual) => (actual + paso + totalFilas) % totalFilas)
      }
    } else if (evento.key === 'Enter' && abierto) {
      // Enter nunca envía el formulario mientras la lista está abierta.
      evento.preventDefault()
      if (activa >= 0) elegirFila(activa)
    } else if (evento.key === 'Escape' && abierto) {
      evento.stopPropagation()
      setAbierto(false)
    }
  }

  return (
    <ContenedorCampo etiqueta={etiqueta} error={error} obligatorio={obligatorio}>
      {(props) => (
        <div className="autocompletar">
          <input
            {...props}
            className="entrada"
            role="combobox"
            aria-expanded={abierto}
            aria-controls={idLista}
            aria-autocomplete="list"
            aria-activedescendant={activa >= 0 ? `${idLista}-${activa}` : undefined}
            autoComplete="off"
            placeholder={placeholder}
            value={texto}
            onChange={(evento) => {
              alCambiarTexto(evento.target.value)
              setAbierto(true)
            }}
            onFocus={() => setAbierto(true)}
            onBlur={() => setAbierto(false)}
            onKeyDown={alPresionar}
          />
          {abierto && totalFilas > 0 && (
            <ul className="autocompletar-lista" id={idLista} role="listbox">
              {opciones.map((opcion, indice) => (
                <li
                  key={claveDe(opcion)}
                  id={`${idLista}-${indice}`}
                  role="option"
                  aria-selected={indice === activa}
                  className={indice === activa ? 'activa' : undefined}
                  onMouseDown={(evento) => {
                    evento.preventDefault()
                    elegirFila(indice)
                  }}
                >
                  {mostrar(opcion)}
                </li>
              ))}
              {accionVisible && (
                <li
                  id={`${idLista}-${opciones.length}`}
                  role="option"
                  aria-selected={activa === opciones.length}
                  className={`autocompletar-accion ${activa === opciones.length ? 'activa' : ''}`}
                  onMouseDown={(evento) => {
                    evento.preventDefault()
                    elegirFila(opciones.length)
                  }}
                >
                  {accionVisible.etiqueta}
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </ContenedorCampo>
  )
}
