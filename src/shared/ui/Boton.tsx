import type { ButtonHTMLAttributes } from 'react'

export type VarianteBoton = 'principal' | 'secundario' | 'destructivo'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBoton
}

export function Boton({ variante = 'secundario', className = '', type = 'button', ...resto }: Props) {
  return <button type={type} className={`boton boton-${variante} ${className}`} {...resto} />
}
