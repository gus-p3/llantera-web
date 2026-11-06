import { http } from '../../shared/api/http'
import type { ClaveAlerta, ClaveEstado } from '../../shared/ui/Etiquetas'

export interface Resumen {
  pedidosActivos: number
  entregasProximas: number
  listosParaRecoger: number
  retrasados: number
}

export interface PedidoConAlerta {
  idPedido: number
  numeroNota: number
  estado: ClaveEstado
  alerta: ClaveAlerta | null
  diasParaEntrega: number
  fechaEstimadaEntrega: string
  actualizadoEn: string
  idCliente: number
  clienteNombre: string
  clienteApellidos: string | null
  clienteTelefono: string
  idVehiculo: number
  placas: string
  modelo: string
  marca: string
}

export const obtenerResumen = () => http.get<Resumen>('/alertas/resumen')

export const listarProximasEntregas = () => http.get<PedidoConAlerta[]>('/alertas/proximas-entregas?limite=8')

export const listarListosParaRecoger = () => http.get<PedidoConAlerta[]>('/alertas/listos-para-recoger')
