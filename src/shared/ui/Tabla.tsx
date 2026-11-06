import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

export interface Columna<T> {
  encabezado: string
  celda: (fila: T) => ReactNode
  // Con este valor la columna se puede ordenar sobre las filas visibles.
  orden?: (fila: T) => string | number | null
}

interface PropsTabla<T> {
  columnas: Columna<T>[]
  filas: T[]
  claveDe: (fila: T) => string | number
  vacio?: string
  menu?: (fila: T) => ReactNode
}

export function Tabla<T>({ columnas, filas, claveDe, vacio = 'Sin resultados.', menu }: PropsTabla<T>) {
  const [orden, setOrden] = useState<{ indice: number; ascendente: boolean } | null>(null)

  const ordenadas = useMemo(() => {
    const valorDe = orden && columnas[orden.indice]?.orden
    if (!orden || !valorDe) return filas
    const signo = orden.ascendente ? 1 : -1
    return [...filas].sort((a, b) => {
      const [x, y] = [valorDe(a), valorDe(b)]
      if (x === y) return 0
      if (x === null) return 1
      if (y === null) return -1
      return x < y ? -signo : signo
    })
  }, [columnas, filas, orden])

  const alternarOrden = (indice: number) =>
    setOrden((actual) =>
      actual?.indice === indice ? { indice, ascendente: !actual.ascendente } : { indice, ascendente: true },
    )

  return (
    <div className="tabla-contenedor">
      <table className="tabla">
        <thead>
          <tr>
            {columnas.map((columna, indice) => (
              <th
                key={columna.encabezado}
                scope="col"
                aria-sort={
                  orden?.indice === indice ? (orden.ascendente ? 'ascending' : 'descending') : undefined
                }
              >
                {columna.orden ? (
                  <button type="button" className="tabla-orden" onClick={() => alternarOrden(indice)}>
                    {columna.encabezado}
                    {orden?.indice === indice &&
                      (orden.ascendente ? (
                        <ArrowUp size={14} aria-hidden="true" />
                      ) : (
                        <ArrowDown size={14} aria-hidden="true" />
                      ))}
                  </button>
                ) : (
                  columna.encabezado
                )}
              </th>
            ))}
            {menu && (
              <th scope="col">
                <span className="visualmente-oculto">Acciones</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {ordenadas.length === 0 ? (
            <tr>
              <td className="tabla-vacia" colSpan={columnas.length + (menu ? 1 : 0)}>
                {vacio}
              </td>
            </tr>
          ) : (
            ordenadas.map((fila) => (
              <tr key={claveDe(fila)}>
                {columnas.map((columna) => (
                  <td key={columna.encabezado}>{columna.celda(fila)}</td>
                ))}
                {menu && <td className="tabla-menu">{menu(fila)}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

interface PropsPaginacion {
  pagina: number
  limite: number
  total: number
  alCambiar: (pagina: number) => void
  sustantivo: string
}

export function Paginacion({ pagina, limite, total, alCambiar, sustantivo }: PropsPaginacion) {
  const paginas = Math.max(1, Math.ceil(total / limite))
  const mostrados = Math.min(limite, Math.max(0, total - (pagina - 1) * limite))
  return (
    <div className="paginacion">
      <span>
        Mostrando {mostrados} de {total} {sustantivo}
      </span>
      {paginas > 1 && (
        <div className="paginacion-botones">
          <button type="button" disabled={pagina === 1} onClick={() => alCambiar(pagina - 1)} aria-label="Página anterior">
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span aria-live="polite">
            {pagina} de {paginas}
          </span>
          <button type="button" disabled={pagina === paginas} onClick={() => alCambiar(pagina + 1)} aria-label="Página siguiente">
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  )
}
