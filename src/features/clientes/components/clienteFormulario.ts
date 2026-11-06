import type { ErroresDeCampo } from '../../../shared/api/http'
import type { Cliente, DatosCliente } from '../clientes.api'

export interface ValorCliente {
  nombre: string
  apellidos: string
  telefono: string
  notas: string
}

export const clienteVacio = (): ValorCliente => ({ nombre: '', apellidos: '', telefono: '', notas: '' })

export const clienteAValor = (cliente: Cliente): ValorCliente => ({
  nombre: cliente.nombre,
  apellidos: cliente.apellidos ?? '',
  telefono: cliente.telefono,
  notas: cliente.notas ?? '',
})

export function validarCliente(valor: ValorCliente): ErroresDeCampo {
  const errores: ErroresDeCampo = {}
  const telefono = valor.telefono.replace(/[\s()-]/g, '')
  if (!valor.nombre.trim()) errores.nombre = 'El nombre es obligatorio.'
  if (!telefono) errores.telefono = 'El teléfono es obligatorio.'
  else if (!/^\+?[0-9]{10,15}$/.test(telefono)) errores.telefono = 'El teléfono debe tener de 10 a 15 dígitos.'
  return errores
}

export const valorAPeticion = (valor: ValorCliente): DatosCliente => ({
  nombre: valor.nombre.trim(),
  apellidos: valor.apellidos.trim() || null,
  telefono: valor.telefono,
  notas: valor.notas.trim() || null,
})
