import type { ErroresDeCampo } from '../../../shared/api/http'
import { formatoPlaca } from '../../../shared/util/formato'
import type { DatosVehiculo, Vehiculo } from '../vehiculos.api'

export interface ValorVehiculo {
  marca: string
  // Con id la marca se eligió de la lista; sin id, el servidor la busca o la crea por nombre.
  idMarca: number | null
  modelo: string
  anio: string
  color: string
  placas: string
  notas: string
}

export const vehiculoVacio = (): ValorVehiculo => ({
  marca: '',
  idMarca: null,
  modelo: '',
  anio: '',
  color: '',
  placas: '',
  notas: '',
})

export const vehiculoAValor = (vehiculo: Vehiculo): ValorVehiculo => ({
  marca: vehiculo.marca.nombre,
  idMarca: vehiculo.marca.id,
  modelo: vehiculo.modelo,
  anio: vehiculo.anio === null ? '' : String(vehiculo.anio),
  color: vehiculo.color ?? '',
  placas: formatoPlaca(vehiculo.placas),
  notas: vehiculo.notas ?? '',
})

export function validarVehiculo(valor: ValorVehiculo): ErroresDeCampo {
  const errores: ErroresDeCampo = {}
  const placa = valor.placas.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const anio = Number(valor.anio)

  if (!valor.marca.trim()) errores.marca = 'Escribe la marca.'
  if (!valor.modelo.trim()) errores.modelo = 'El modelo es obligatorio.'
  if (!placa) errores.placas = 'La placa es obligatoria.'
  else if (placa.length < 3 || placa.length > 15) errores.placas = 'La placa debe tener de 3 a 15 letras o números.'
  if (valor.anio.trim() && (!Number.isInteger(anio) || anio < 1900 || anio > 2100)) {
    errores.anio = 'El año debe estar entre 1900 y 2100.'
  }
  return errores
}

export const valorAPeticion = (valor: ValorVehiculo): DatosVehiculo => ({
  marca: valor.idMarca ? { id: valor.idMarca } : { nombre: valor.marca.trim() },
  modelo: valor.modelo.trim(),
  placas: valor.placas,
  anio: valor.anio.trim() ? Number(valor.anio) : null,
  color: valor.color.trim() || null,
  notas: valor.notas.trim() || null,
})
