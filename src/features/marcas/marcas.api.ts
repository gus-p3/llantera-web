import { aConsulta, http } from '../../shared/api/http'

export interface Marca {
  id: number
  nombre: string
}

export const listarMarcas = (q?: string) => http.get<Marca[]>(`/marcas${aConsulta({ q })}`)
