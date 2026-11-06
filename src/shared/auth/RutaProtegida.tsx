import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Cargando } from '../ui/Estados'
import { useSesion } from './sesion'

export function RutaProtegida() {
  const { usuario, iniciando } = useSesion()
  const { pathname } = useLocation()

  if (iniciando) return <Cargando />
  if (!usuario) return <Navigate to="/login" replace state={{ desde: pathname }} />
  if (usuario.debeCambiarPassword) return <Navigate to="/cambiar-password" replace />
  return <Outlet />
}
