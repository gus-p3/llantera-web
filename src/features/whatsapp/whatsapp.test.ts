import { describe, expect, it } from 'vitest'
import { enlaceWhatsApp, mensajeListoParaRecoger, telefonoInternacional } from './whatsapp'

describe('whatsapp', () => {
  it('agrega la lada 52 a los 10 dígitos y respeta el +', () => {
    expect(telefonoInternacional('418 123 4567')).toBe('524181234567')
    expect(telefonoInternacional('+14155550123')).toBe('14155550123')
    expect(telefonoInternacional('+524181234567')).toBe('524181234567')
  })

  it('arma el mensaje y el enlace con el texto codificado', () => {
    const mensaje = mensajeListoParaRecoger({ nombre: 'Juan', marca: 'Nissan', modelo: 'Versa', placas: 'ABC123' })
    expect(mensaje).toBe(
      'Hola, Juan. Tu Nissan Versa con placas ABC-123 ya está listo para recoger en Taller y Llantera del Bosque. ¡Te esperamos!',
    )
    expect(enlaceWhatsApp('4181234567', 'Hola, Juan')).toBe('https://wa.me/524181234567?text=Hola%2C%20Juan')
  })
})
