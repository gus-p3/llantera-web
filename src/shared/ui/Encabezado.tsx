import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Miga {
  etiqueta: string
  ruta?: string
}

interface Props {
  titulo: ReactNode
  subtitulo?: ReactNode
  migas?: Miga[]
  acciones?: ReactNode
}

export function Encabezado({ titulo, subtitulo, migas, acciones }: Props) {
  return (
    <header className="encabezado">
      <div>
        {migas && (
          <nav className="migas" aria-label="Ruta de navegación">
            {migas.map((miga, indice) => (
              <span key={miga.etiqueta} className="migas-paso">
                {indice > 0 && <ChevronRight size={14} aria-hidden="true" />}
                {miga.ruta ? <Link to={miga.ruta}>{miga.etiqueta}</Link> : miga.etiqueta}
              </span>
            ))}
          </nav>
        )}
        <div className="encabezado-titulo">
          <h1>{titulo}</h1>
          {subtitulo && <span className="encabezado-subtitulo">{subtitulo}</span>}
        </div>
      </div>
      {acciones && <div className="encabezado-acciones">{acciones}</div>}
    </header>
  )
}
