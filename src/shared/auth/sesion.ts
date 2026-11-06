import { createContext, useContext } from 'react'

export interface Usuario {
  id: number
  username: string
  nombre: string
  apellidos: string | null
  rol: 'ADMIN' | 'SECRETARIA'
  debeCambiarPassword: boolean
}

export interface SesionRespuesta {
  token: string
  usuario: Usuario
}

export interface ContextoSesion {
  usuario: Usuario | null
  iniciando: boolean
  iniciarSesion: (username: string, password: string) => Promise<Usuario>
  cambiarPassword: (passwordActual: string, passwordNueva: string) => Promise<void>
  cerrarSesion: () => void
}

export const SesionContexto = createContext<ContextoSesion | null>(null)

export function useSesion() {
  const contexto = useContext(SesionContexto)
  if (!contexto) throw new Error('useSesion debe usarse dentro de SesionProveedor')
  return contexto
}
