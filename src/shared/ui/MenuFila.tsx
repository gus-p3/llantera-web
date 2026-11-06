import { MoreVertical } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export interface OpcionMenu {
  etiqueta: string
  alElegir: () => void
  destructiva?: boolean
  deshabilitada?: boolean
  // Explica por qué la opción está deshabilitada.
  ayuda?: string
}

export function MenuFila({ etiqueta, opciones }: { etiqueta: string; opciones: OpcionMenu[] }) {
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const cerrarAlSalir = (evento: MouseEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false)
    }
    const cerrarConEscape = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('mousedown', cerrarAlSalir)
    document.addEventListener('keydown', cerrarConEscape)
    return () => {
      document.removeEventListener('mousedown', cerrarAlSalir)
      document.removeEventListener('keydown', cerrarConEscape)
    }
  }, [abierto])

  return (
    <div className="menu-fila" ref={contenedor}>
      <button
        type="button"
        className="menu-fila-boton"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={etiqueta}
        onClick={() => setAbierto((actual) => !actual)}
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>
      {abierto && (
        <div className="menu-fila-lista" role="menu">
          {opciones.map((opcion) => (
            <button
              key={opcion.etiqueta}
              type="button"
              role="menuitem"
              disabled={opcion.deshabilitada}
              className={opcion.destructiva ? 'destructiva' : undefined}
              onClick={() => {
                setAbierto(false)
                opcion.alElegir()
              }}
            >
              {opcion.etiqueta}
              {opcion.deshabilitada && opcion.ayuda && <small>{opcion.ayuda}</small>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
