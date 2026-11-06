import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export type TipoBanner = 'informacion' | 'exito' | 'advertencia' | 'error'

const ICONOS: Record<TipoBanner, LucideIcon> = {
  informacion: Info,
  exito: CheckCircle2,
  advertencia: AlertTriangle,
  error: XCircle,
}

export function Banner({ tipo = 'informacion', children }: { tipo?: TipoBanner; children: ReactNode }) {
  const Icono = ICONOS[tipo]
  return (
    <div className={`banner banner-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <Icono size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  )
}
