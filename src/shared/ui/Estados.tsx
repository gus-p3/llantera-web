import { Inbox, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

export const Cargando = () => (
  <div className="estado-pagina" role="status">
    <Loader2 size={22} className="estado-girando" aria-hidden="true" />
    <span>Cargando…</span>
  </div>
)

export const Vacio = ({ children }: { children: ReactNode }) => (
  <div className="estado-pagina">
    <span className="estado-icono" aria-hidden="true">
      <Inbox size={20} />
    </span>
    <p>{children}</p>
  </div>
)
