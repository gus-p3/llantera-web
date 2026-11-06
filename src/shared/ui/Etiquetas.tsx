import {
  AlarmClock,
  CheckCircle2,
  Clock,
  Inbox,
  PackageCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export type ClaveEstado = 'RECIBIDO' | 'EN_SERVICIO' | 'LISTO' | 'ENTREGADO'
export type ClaveAlerta = 'ENTREGA_PROXIMA' | 'RETRASADO' | 'DEBE_RECOGER'

const ESTADOS: Record<ClaveEstado, { texto: string; clase: string; icono: LucideIcon }> = {
  RECIBIDO: { texto: 'Recibido', clase: 'etiqueta-informacion', icono: Inbox },
  EN_SERVICIO: { texto: 'En servicio', clase: 'etiqueta-advertencia', icono: Wrench },
  LISTO: { texto: 'Listo', clase: 'etiqueta-exito', icono: CheckCircle2 },
  ENTREGADO: { texto: 'Entregado', clase: 'etiqueta-neutra', icono: PackageCheck },
}

const ALERTAS: Record<ClaveAlerta, { texto: string; clase: string; icono: LucideIcon }> = {
  ENTREGA_PROXIMA: { texto: 'Entrega próxima', clase: 'etiqueta-advertencia', icono: Clock },
  RETRASADO: { texto: 'Retrasado', clase: 'etiqueta-error', icono: AlarmClock },
  DEBE_RECOGER: { texto: 'Debe recoger', clase: 'etiqueta-exito', icono: CheckCircle2 },
}

// Siempre con texto e ícono: el color solo no basta para personas con daltonismo.
export function EtiquetaEstado({ estado }: { estado: ClaveEstado }) {
  const { texto, clase, icono: Icono } = ESTADOS[estado]
  return (
    <span className={`etiqueta ${clase}`}>
      <Icono size={14} aria-hidden="true" />
      {texto}
    </span>
  )
}

export function EtiquetaAlerta({ alerta, texto }: { alerta: ClaveAlerta; texto?: string }) {
  const { texto: textoBase, clase, icono: Icono } = ALERTAS[alerta]
  return (
    <span className={`etiqueta ${clase}`}>
      <Icono size={14} aria-hidden="true" />
      {texto ?? textoBase}
    </span>
  )
}
