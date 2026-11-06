import { Search } from 'lucide-react'
import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'

interface PropsContenedor {
  etiqueta: string
  error?: string
  obligatorio?: boolean
  children: (props: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode
}

export function ContenedorCampo({ etiqueta, error, obligatorio, children }: PropsContenedor) {
  const id = useId()
  const idError = `${id}-error`
  return (
    <div className="campo">
      <label htmlFor={id}>
        {etiqueta}
        {obligatorio && <span aria-hidden="true"> *</span>}
      </label>
      {children({
        id,
        ...(error ? { 'aria-invalid': true as const, 'aria-describedby': idError } : {}),
      })}
      {error && (
        <p className="campo-error" id={idError}>
          {error}
        </p>
      )}
    </div>
  )
}

interface PropsTexto extends InputHTMLAttributes<HTMLInputElement> {
  etiqueta: string
  error?: string
  obligatorio?: boolean
  mono?: boolean
}

export function CampoTexto({ etiqueta, error, obligatorio, mono, className = '', ...resto }: PropsTexto) {
  return (
    <ContenedorCampo etiqueta={etiqueta} error={error} obligatorio={obligatorio}>
      {(props) => (
        <input className={`entrada ${mono ? 'mono' : ''} ${className}`} {...props} {...resto} />
      )}
    </ContenedorCampo>
  )
}

interface PropsArea extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  etiqueta: string
  error?: string
  obligatorio?: boolean
}

export function CampoArea({ etiqueta, error, obligatorio, rows = 3, ...resto }: PropsArea) {
  return (
    <ContenedorCampo etiqueta={etiqueta} error={error} obligatorio={obligatorio}>
      {(props) => <textarea className="entrada" rows={rows} {...props} {...resto} />}
    </ContenedorCampo>
  )
}

interface PropsBuscador {
  valor: string
  alCambiar: (valor: string) => void
  placeholder: string
}

export function Buscador({ valor, alCambiar, placeholder }: PropsBuscador) {
  return (
    <div className="buscador">
      <Search size={18} aria-hidden="true" />
      <input
        className="entrada"
        type="search"
        value={valor}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(evento) => alCambiar(evento.target.value)}
      />
    </div>
  )
}
