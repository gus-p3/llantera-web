import { describe, expect, it } from 'vitest'
import {
  fechaCorta,
  fechaLarga,
  formatoNota,
  formatoPlaca,
  formatoTelefono,
  mesYAnio,
  nombreCompleto,
} from './formato'

describe('formato', () => {
  it('muestra la placa con guion sin cambiar lo guardado', () => {
    expect(formatoPlaca('ABC123')).toBe('ABC-123')
    expect(formatoPlaca('ABC1234')).toBe('ABC-1234')
    expect(formatoPlaca('AB1')).toBe('AB1')
  })

  it('rellena el número de nota a cuatro dígitos', () => {
    expect(formatoNota(42)).toBe('0042')
    expect(formatoNota(12345)).toBe('12345')
  })

  it('agrupa teléfonos de 10 dígitos y deja igual los demás', () => {
    expect(formatoTelefono('4180000001')).toBe('418 000 0001')
    expect(formatoTelefono('+524180000001')).toBe('+524180000001')
  })

  it('no recorre el día de las fechas', () => {
    expect(fechaCorta('2026-10-01')).toBe('1 oct')
    expect(fechaLarga('2026-01-31')).toBe('31 ene 2026')
    expect(fechaLarga(null)).toBe('—')
  })

  it('une nombre y apellidos cuando existen', () => {
    expect(nombreCompleto({ nombre: 'Juan', apellidos: 'Pérez' })).toBe('Juan Pérez')
    expect(nombreCompleto({ nombre: 'Juan', apellidos: null })).toBe('Juan')
  })

  it('muestra mes y año de una fecha con hora', () => {
    expect(mesYAnio('2026-01-15T18:00:00.000Z')).toBe('ene 2026')
  })
})
