import type { ReactNode } from 'react'

export const Cargando = () => (
  <p className="estado-pagina" role="status">
    Cargando…
  </p>
)

export const Vacio = ({ children }: { children: ReactNode }) => <p className="estado-pagina">{children}</p>
