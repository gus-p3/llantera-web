import { aConsulta, http, type Pagina } from '../../shared/api/http'
import type { Marca } from '../marcas/marcas.api'
import type { PedidoResumen } from '../pedidos/pedidos.api'

export interface Vehiculo {
  id: number
  placas: string
  marca: Marca
  modelo: string
  anio: number | null
  color: string | null
  notas: string | null
  ultimoServicio: string | null
  pedidos: number
  puedeEliminar: boolean
  dueno: { id: number; nombre: string; apellidos: string | null; telefono: string }
}

export interface VehiculoDetalle extends Vehiculo {
  otrosVehiculosDelCliente: number
}

export interface DatosVehiculo {
  marca: { id: number } | { nombre: string }
  modelo: string
  placas: string
  anio: number | null
  color: string | null
  notas: string | null
}

interface FiltrosVehiculos {
  q?: string
  idMarca?: number
  pagina?: number
}

export const listarVehiculos = (filtros: FiltrosVehiculos) =>
  http.get<Pagina<Vehiculo>>(`/vehiculos${aConsulta({ ...filtros })}`)

export const obtenerVehiculo = (id: number) => http.get<VehiculoDetalle>(`/vehiculos/${id}`)

export const obtenerHistorial = (id: number) => http.get<PedidoResumen[]>(`/vehiculos/${id}/historial`)

export const crearVehiculo = (idCliente: number, datos: DatosVehiculo) =>
  http.post<Vehiculo>('/vehiculos', { idCliente, ...datos })

export const actualizarVehiculo = (id: number, datos: DatosVehiculo) =>
  http.put<Vehiculo>(`/vehiculos/${id}`, datos)
