import { useCallback, useEffect, useRef, useState } from 'react'

// Carga datos al montar y cuando cambian las dependencias (valores simples, como filtros y página).
// Ignora las respuestas que llegan fuera de orden.
export function useRecurso<T>(cargar: () => Promise<T>, dependencias: readonly unknown[]) {
  const [datos, setDatos] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const cargarActual = useRef(cargar)
  const ultimaPeticion = useRef(0)

  useEffect(() => {
    cargarActual.current = cargar
  })

  const recargar = useCallback(async () => {
    const peticion = ++ultimaPeticion.current
    setCargando(true)
    try {
      const resultado = await cargarActual.current()
      if (peticion === ultimaPeticion.current) {
        setDatos(resultado)
        setError(null)
      }
    } catch (causa) {
      if (peticion === ultimaPeticion.current) setError((causa as Error).message)
    } finally {
      if (peticion === ultimaPeticion.current) setCargando(false)
    }
  }, [])

  const clave = JSON.stringify(dependencias)
  useEffect(() => {
    void recargar()
  }, [clave, recargar])

  return { datos, error, cargando, recargar }
}

export function useValorRetrasado<T>(valor: T, milisegundos = 300) {
  const [retrasado, setRetrasado] = useState(valor)
  useEffect(() => {
    const temporizador = setTimeout(() => setRetrasado(valor), milisegundos)
    return () => clearTimeout(temporizador)
  }, [valor, milisegundos])
  return retrasado
}
