import { Car, FileText, Home, LogOut, Megaphone, User, Wrench, type LucideIcon } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useSesion } from '../auth/sesion'
import './Layout.css'

interface Seccion {
  ruta: string
  etiqueta: string
  icono: LucideIcon
}

const SECCIONES: Seccion[] = [
  { ruta: '/', etiqueta: 'Inicio', icono: Home },
  { ruta: '/pedidos', etiqueta: 'Pedidos', icono: FileText },
  { ruta: '/clientes', etiqueta: 'Clientes', icono: User },
  { ruta: '/vehiculos', etiqueta: 'Vehículos', icono: Car },
  { ruta: '/promociones', etiqueta: 'Promociones', icono: Megaphone },
]

const ETIQUETA_ROL = { ADMIN: 'Administrador', SECRETARIA: 'Secretaría' }

export function Layout() {
  const { usuario, cerrarSesion } = useSesion()
  const { pathname } = useLocation()
  if (!usuario) return null

  return (
    <div className="layout">
      <header className="layout-barra">
        <div className="layout-marca">
          <span className="layout-sello" aria-hidden="true">
            <Wrench size={18} strokeWidth={2.25} />
          </span>
          <span className="layout-marca-texto">
            <span className="layout-marca-nombre">Taller y Llantera</span>
            <span className="layout-marca-lugar">del Bosque</span>
          </span>
        </div>
        <div className="layout-usuario">
          <span className="layout-usuario-datos">
            <span className="layout-usuario-nombre">{usuario.nombre}</span>
            <span className="layout-usuario-rol">{ETIQUETA_ROL[usuario.rol]}</span>
          </span>
          <span className="layout-avatar" aria-hidden="true">
            {usuario.nombre.charAt(0).toUpperCase()}
          </span>
          <button className="layout-salir" type="button" onClick={cerrarSesion} title="Cerrar sesión">
            <LogOut size={18} aria-hidden="true" />
            <span className="visualmente-oculto">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <nav className="layout-menu" aria-label="Menú principal">
        <span className="layout-menu-titulo">Operación</span>
        {SECCIONES.map(({ ruta, etiqueta, icono: Icono }) => (
          <NavLink key={ruta} to={ruta} end={ruta === '/'} className="layout-enlace">
            <Icono size={18} aria-hidden="true" />
            {etiqueta}
          </NavLink>
        ))}
      </nav>

      <main className="layout-contenido">
        {/* La clave reinicia la animación de entrada en cada cambio de pantalla. */}
        <div key={pathname} className="layout-transicion">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
