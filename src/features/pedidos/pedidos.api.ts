import { aConsulta, http, type Pagina } from '../../shared/api/http'
import type { ClaveAlerta, ClaveEstado } from '../../shared/ui/Etiquetas'

export interface PedidoResumen {
  id: number
  numeroNota: number
  descripcion: string
  observaciones: string | null
  fechaIngreso: string
  fechaEstimadaEntrega: string
  fechaSalida: string | null
  precioTotal: number | null
  estado: { clave: ClaveEstado; nombre: string }
  alerta: ClaveAlerta | null
  vehiculo: { id: number; placas: string; marca: string; modelo: string; anio: number | null; color: string | null }
  cliente: { id: number; nombre: string; apellidos: string | null; telefono: string }
}

export interface PedidoDetalle extends PedidoResumen {
  productos: Producto[]
  encargados: { idEmpleado: number; nombre: string; apellidos: string | null; esResponsable: boolean }[]
}

export interface Producto {
  id: number
  nombre: string
}

export interface Encargado {
  id: number
  nombre: string
  apellidos: string | null
  puesto: string
}

export interface DatosPedido {
  descripcion: string
  fechaEstimadaEntrega: string
  observaciones: string | null
  precioTotal?: number | null
  productos: ({ id: number } | { nombre: string })[]
  encargados: { idEmpleado: number; esResponsable: boolean }[]
}

export interface NuevoPedido extends DatosPedido {
  idVehiculo: number
}

// Los mismos nombres que acepta GET /api/pedidos; la pantalla los guarda tal cual en la URL.
export const FILTROS_PEDIDOS = [
  'entregados',
  'q',
  'idMarca',
  'modelo',
  'estado',
  'alerta',
  'ingresoDesde',
  'ingresoHasta',
  'salidaDesde',
  'salidaHasta',
  'pagina',
] as const

export type FiltrosPedidos = Partial<Record<(typeof FILTROS_PEDIDOS)[number], string>>

export const listarPedidos = (filtros: FiltrosPedidos) =>
  http.get<Pagina<PedidoResumen>>(`/pedidos${aConsulta(filtros)}`)

export const obtenerPedido = (id: number) => http.get<PedidoDetalle>(`/pedidos/${id}`)

export const crearPedido = (datos: NuevoPedido) => http.post<PedidoResumen>('/pedidos', datos)

export const actualizarPedido = (id: number, datos: DatosPedido) => http.put<PedidoDetalle>(`/pedidos/${id}`, datos)

export const avanzarPedido = (id: number) => http.post<PedidoDetalle>(`/pedidos/${id}/avanzar`)

export const regresarPedido = (id: number) => http.post<PedidoDetalle>(`/pedidos/${id}/regresar`)

export const buscarProductos = (q: string) => http.get<Producto[]>(`/productos${aConsulta({ q })}`)

export const buscarEncargados = (q: string) => http.get<Encargado[]>(`/empleados/encargados${aConsulta({ q })}`)

export const crearEncargado = (nombre: string) => http.post<Encargado>('/empleados/encargados', { nombre })
