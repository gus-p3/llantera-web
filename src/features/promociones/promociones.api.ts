import { http } from '../../shared/api/http'

export interface Promocion {
  id: number
  titulo: string
  mensaje: string
  actualizadoEn: string
  registradaPor: { id: number; nombre: string }
}

export interface Contacto {
  id: number
  nombre: string
  apellidos: string | null
  telefono: string
}

export interface DatosPromocion {
  titulo: string
  mensaje: string
}

export const listarPromociones = () => http.get<Promocion[]>('/promociones')

export const listarContactos = () => http.get<Contacto[]>('/promociones/contactos')

export const crearPromocion = (datos: DatosPromocion) => http.post<Promocion>('/promociones', datos)

export const actualizarPromocion = (id: number, datos: DatosPromocion) =>
  http.put<Promocion>(`/promociones/${id}`, datos)

export const eliminarPromocion = (id: number) => http.delete(`/promociones/${id}`)
