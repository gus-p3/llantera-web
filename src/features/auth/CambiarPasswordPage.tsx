import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useSesion } from '../../shared/auth/sesion'
import { Banner } from '../../shared/ui/Banner'
import { Boton } from '../../shared/ui/Boton'
import { CampoTexto } from '../../shared/ui/Campo'
import { Cargando } from '../../shared/ui/Estados'

export function CambiarPasswordPage() {
  const { usuario, iniciando, cambiarPassword, cerrarSesion } = useSesion()
  const navegar = useNavigate()
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [repetida, setRepetida] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  if (iniciando) return <Cargando />
  if (!usuario) return <Navigate to="/login" replace />

  async function guardar(evento: FormEvent) {
    evento.preventDefault()
    setError(null)
    if (nueva.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (nueva !== repetida) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setEnviando(true)
    try {
      await cambiarPassword(actual, nueva)
      navegar('/', { replace: true })
    } catch (causa) {
      setError((causa as Error).message)
      setEnviando(false)
    }
  }

  return (
    <div className="acceso">
      <form className="acceso-tarjeta" onSubmit={guardar}>
        <div>
          <h1>Cambia tu contraseña</h1>
          <p className="texto-suave">
            {usuario.debeCambiarPassword
              ? 'Es tu primer acceso: define una contraseña nueva para continuar.'
              : 'Define una contraseña nueva.'}
          </p>
        </div>
        {error && <Banner tipo="error">{error}</Banner>}
        <CampoTexto
          etiqueta="Contraseña actual"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          value={actual}
          onChange={(evento) => setActual(evento.target.value)}
        />
        <CampoTexto
          etiqueta="Contraseña nueva"
          type="password"
          autoComplete="new-password"
          required
          value={nueva}
          onChange={(evento) => setNueva(evento.target.value)}
        />
        <CampoTexto
          etiqueta="Repite la contraseña nueva"
          type="password"
          autoComplete="new-password"
          required
          value={repetida}
          onChange={(evento) => setRepetida(evento.target.value)}
        />
        <Boton variante="principal" type="submit" disabled={enviando}>
          Guardar contraseña
        </Boton>
        <Boton onClick={cerrarSesion}>Cerrar sesión</Boton>
      </form>
    </div>
  )
}
