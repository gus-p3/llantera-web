import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  borrarToken,
  guardarToken,
  http,
  leerToken,
  registrarExpiracionDeSesion,
} from '../api/http'
import { SesionContexto, type SesionRespuesta, type Usuario } from './sesion'

export function SesionProveedor({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [iniciando, setIniciando] = useState(() => leerToken() !== null)

  const cerrarSesion = useCallback(() => {
    borrarToken()
    setUsuario(null)
  }, [])

  useEffect(() => {
    registrarExpiracionDeSesion(cerrarSesion)
    if (!leerToken()) return
    http
      .get<Usuario>('/auth/yo')
      .then(setUsuario)
      .catch(cerrarSesion)
      .finally(() => setIniciando(false))
  }, [cerrarSesion])

  const iniciarSesion = useCallback(async (username: string, password: string) => {
    const sesion = await http.post<SesionRespuesta>('/auth/login', { username, password })
    guardarToken(sesion.token)
    setUsuario(sesion.usuario)
    return sesion.usuario
  }, [])

  const cambiarPassword = useCallback(async (passwordActual: string, passwordNueva: string) => {
    const sesion = await http.post<SesionRespuesta>('/auth/cambiar-password', {
      passwordActual,
      passwordNueva,
    })
    guardarToken(sesion.token)
    setUsuario(sesion.usuario)
  }, [])

  const valor = useMemo(
    () => ({ usuario, iniciando, iniciarSesion, cambiarPassword, cerrarSesion }),
    [usuario, iniciando, iniciarSesion, cambiarPassword, cerrarSesion],
  )

  return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>
}
