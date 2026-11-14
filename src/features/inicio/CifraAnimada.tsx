import { useEffect, useState } from 'react'

const DURACION_MS = 700

const prefiereMenosMovimiento = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Muestra un número que cuenta desde cero hasta su valor al aparecer en pantalla. */
export function CifraAnimada({ valor, className }: { valor: number; className?: string }) {
  const animar = valor !== 0 && !prefiereMenosMovimiento()
  const [mostrado, setMostrado] = useState(0)

  useEffect(() => {
    if (!animar) return
    let cuadro = 0
    const inicio = performance.now()
    const avanzar = (ahora: number) => {
      const progreso = Math.min((ahora - inicio) / DURACION_MS, 1)
      // Desaceleración cúbica: arranca rápido y se asienta con suavidad.
      const suavizado = 1 - (1 - progreso) ** 3
      setMostrado(Math.round(valor * suavizado))
      if (progreso < 1) cuadro = requestAnimationFrame(avanzar)
    }
    cuadro = requestAnimationFrame(avanzar)
    return () => cancelAnimationFrame(cuadro)
  }, [animar, valor])

  return <span className={className}>{animar ? mostrado : valor}</span>
}
