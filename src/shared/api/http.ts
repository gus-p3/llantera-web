const CLAVE_TOKEN = 'taller.token'

export type ErroresDeCampo = Record<string, string>

export class ErrorHttp extends Error {
  estado: number
  codigo: string
  campos: ErroresDeCampo

  constructor(estado: number, codigo: string, mensaje: string, campos: ErroresDeCampo = {}) {
    super(mensaje)
    this.estado = estado
    this.codigo = codigo
    this.campos = campos
  }
}

export interface Pagina<T> {
  datos: T[]
  total: number
  pagina: number
  limite: number
}

// La sesión dura lo que la pestaña: en la PC del taller no queda abierta al cerrar el navegador.
export const leerToken = () => sessionStorage.getItem(CLAVE_TOKEN)
export const guardarToken = (token: string) => sessionStorage.setItem(CLAVE_TOKEN, token)
export const borrarToken = () => sessionStorage.removeItem(CLAVE_TOKEN)

let alExpirarSesion: () => void = () => {}
export const registrarExpiracionDeSesion = (fn: () => void) => {
  alExpirarSesion = fn
}

export function aConsulta(parametros: Record<string, string | number | undefined | null>) {
  const consulta = new URLSearchParams()
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== null && valor !== '') consulta.set(clave, String(valor))
  }
  const texto = consulta.toString()
  return texto ? `?${texto}` : ''
}

async function peticion<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  const token = leerToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json'

  let respuesta: Response
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    throw new ErrorHttp(0, 'SIN_CONEXION', 'No se pudo conectar con el servidor.')
  }

  if (respuesta.status === 204) return undefined as T

  const datos = await respuesta.json().catch(() => null)
  if (respuesta.ok) return datos as T

  const error = datos?.error
  if (respuesta.status === 401 && error?.codigo === 'NO_AUTENTICADO') alExpirarSesion()
  throw new ErrorHttp(
    respuesta.status,
    error?.codigo ?? 'ERROR',
    error?.mensaje ?? 'Ocurrió un error inesperado.',
    error?.campos,
  )
}

export const http = {
  get: <T>(ruta: string) => peticion<T>('GET', ruta),
  post: <T>(ruta: string, cuerpo?: unknown) => peticion<T>('POST', ruta, cuerpo),
  put: <T>(ruta: string, cuerpo?: unknown) => peticion<T>('PUT', ruta, cuerpo),
  delete: (ruta: string) => peticion<void>('DELETE', ruta),
}
