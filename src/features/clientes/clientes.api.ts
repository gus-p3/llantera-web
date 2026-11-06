import { aConsulta, http, type Pagina } from '../../shared/api/http'
import type { PedidoResumen } from '../pedidos/pedidos.api'
import type { DatosVehiculo, Vehiculo } from '../vehiculos/vehiculos.api'

export interface Cliente {
  id: number
  nombre: string
  apellidos: string | null
  telefono: string
  notas: string | null
  creadoEn: string
  vehiculos: number
  pedidosActivos: number
  pedidosTotales: number
  ultimaVisita: string | null
  puedeEliminar: boolean
}

export interface ClienteDetalle extends Cliente {
  listaVehiculos: Vehiculo[]
  listaPedidos: PedidoResumen[]
}

export interface DatosCliente {
  nombre: string
  apellidos: string | null
  telefono: string
  notas: string | null
}

export const listarClientes = (filtros: { q?: string; pagina?: number; limite?: number }) =>
  http.get<Pagina<Cliente>>(`/clientes${aConsulta(filtros)}`)

export const obtenerCliente = (id: number) => http.get<ClienteDetalle>(`/clientes/${id}`)

export const actualizarCliente = (id: number, datos: DatosCliente) => http.put<Cliente>(`/clientes/${id}`, datos)

export const eliminarCliente = (id: number) => http.delete(`/clientes/${id}`)

export const crearClienteConVehiculo = (cliente: DatosCliente, vehiculo: DatosVehiculo) =>
  http.post<{ cliente: Cliente; vehiculo: Vehiculo }>('/clientes/con-vehiculo', { cliente, vehiculo })
