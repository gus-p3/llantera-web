import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useSesion } from '../../shared/auth/sesion'
import { Banner } from '../../shared/ui/Banner'
import { Boton } from '../../shared/ui/Boton'
import { CampoTexto } from '../../shared/ui/Campo'

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
          Entrar
        </Boton>
        <p className="texto-suave">Tras 5 intentos fallidos, la cuenta se bloquea durante 15 minutos.</p>
      </form>
    </div>
  )
}
