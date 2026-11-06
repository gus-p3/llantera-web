import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Banner } from './Banner'
import { Boton } from './Boton'

interface PropsModal {
  titulo: string
  alCerrar: () => void
  children: ReactNode
  pie?: ReactNode
  ancho?: 'normal' | 'amplio'
}

const ENFOCABLES = 'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]'

export function Modal({ titulo, alCerrar, children, pie, ancho = 'normal' }: PropsModal) {
  const ventana = useRef<HTMLDivElement>(null)
  const idTitulo = useId()
  const cerrar = useRef(alCerrar)

  useEffect(() => {
    cerrar.current = alCerrar
  })

  useEffect(() => {
    const enfocadoAntes = document.activeElement as HTMLElement | null
    ventana.current?.querySelector<HTMLElement>('.modal-cuerpo input, .modal-cuerpo textarea')?.focus()

    const alPresionar = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') cerrar.current()
      if (evento.key !== 'Tab' || !ventana.current) return
      const enfocables = [...ventana.current.querySelectorAll<HTMLElement>(ENFOCABLES)]
      const primero = enfocables[0]
      const ultimo = enfocables[enfocables.length - 1]
      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', alPresionar)
    return () => {
      document.removeEventListener('keydown', alPresionar)
      enfocadoAntes?.focus()
    }
  }, [])

  return createPortal(
    <div className="modal-velo">
      <div
        ref={ventana}
        className={`modal modal-${ancho}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
      >
        <header className="modal-encabezado">
          <h2 id={idTitulo}>{titulo}</h2>
          <button type="button" className="modal-cerrar" onClick={alCerrar} aria-label="Cerrar">
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="modal-cuerpo">{children}</div>
        {pie && <footer className="modal-pie">{pie}</footer>}
      </div>
    </div>,
    document.body,
  )
}

interface PropsConfirmacion {
  titulo: string
  mensaje: ReactNode
  etiquetaConfirmar: string
  error?: string | null
  ocupado?: boolean
  alConfirmar: () => void
  alCancelar: () => void
}

// Las acciones irreversibles siempre piden confirmación con el botón destructivo.
export function Confirmacion({
  titulo,
  mensaje,
  etiquetaConfirmar,
  error,
  ocupado,
  alConfirmar,
  alCancelar,
}: PropsConfirmacion) {
  return (
    <Modal
      titulo={titulo}
      alCerrar={alCancelar}
      pie={
        <>
          <Boton onClick={alCancelar}>Cancelar</Boton>
          <Boton variante="destructivo" onClick={alConfirmar} disabled={ocupado}>
            {etiquetaConfirmar}
          </Boton>
        </>
      }
    >
      <div className="pila">
        <p>{mensaje}</p>
        {error && <Banner tipo="error">{error}</Banner>}
      </div>
    </Modal>
  )
}
