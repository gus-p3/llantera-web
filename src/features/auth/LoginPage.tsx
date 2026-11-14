import { useState, type FormEvent } from 'react'
import { BellRing, ClipboardList, ShieldCheck, Users, Wrench } from 'lucide-react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSesion } from '../../shared/auth/sesion'
import { Banner } from '../../shared/ui/Banner'
import { Boton } from '../../shared/ui/Boton'
import { CampoTexto } from '../../shared/ui/Campo'

const PUNTOS = [
  { icono: ClipboardList, texto: 'Pedidos de servicio con su nota y su avance' },
  { icono: Users, texto: 'Clientes y vehículos en un solo lugar' },
  { icono: BellRing, texto: 'Alertas de entrega y aviso por WhatsApp' },
]

export function LoginPage() {
  const { usuario, iniciarSesion } = useSesion()
  const navegar = useNavigate()
  const desde = (useLocation().state as { desde?: string } | null)?.desde ?? '/'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to={usuario.debeCambiarPassword ? '/cambiar-password' : desde} replace />

  async function entrar(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const usuarioActual = await iniciarSesion(username.trim(), password)
      navegar(usuarioActual.debeCambiarPassword ? '/cambiar-password' : desde, { replace: true })
    } catch (causa) {
      setError((causa as Error).message)
      setPassword('')
      setEnviando(false)
    }
  }

  return (
    <div className="acceso">
      <aside className="acceso-panel" aria-hidden="true">
        <div className="acceso-marca">
          <span className="layout-sello">
            <Wrench size={18} strokeWidth={2.25} />
          </span>
          Taller y Llantera del Bosque
        </div>
        <div className="acceso-titular">
          <h2>El taller, ordenado de la recepción a la entrega.</h2>
          <p>Sistema interno para la secretaría y la administración del taller.</p>
        </div>
        <ul className="acceso-puntos">
          {PUNTOS.map(({ icono: Icono, texto }) => (
            <li key={texto}>
              <span className="acceso-puntos-icono">
                <Icono size={16} />
              </span>
              {texto}
            </li>
          ))}
        </ul>
      </aside>

      <div className="acceso-formulario">
        <form className="acceso-tarjeta" onSubmit={entrar}>
          <div>
            <h1>Taller y Llantera del Bosque</h1>
            <p className="texto-suave">Inicia sesión para continuar</p>
          </div>
          {error && <Banner tipo="error">{error}</Banner>}
          <CampoTexto
            etiqueta="Usuario"
            autoComplete="username"
            required
            autoFocus
            value={username}
            onChange={(evento) => setUsername(evento.target.value)}
          />
          <CampoTexto
            etiqueta="Contraseña"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
          />
          <Boton variante="principal" type="submit" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </Boton>
          <p className="acceso-nota">
            <ShieldCheck size={16} aria-hidden="true" />
            Tras 5 intentos fallidos, la cuenta se bloquea durante 15 minutos.
          </p>
        </form>
      </div>
    </div>
  )
}
