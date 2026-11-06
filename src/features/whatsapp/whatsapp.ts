import { formatoPlaca } from '../../shared/util/formato'

export const NOMBRE_TALLER = 'Taller y Llantera del Bosque'

// Plantilla del aviso «listo para recoger»: se cambia aquí y la usan Inicio y Detalle del pedido.
export const mensajeListoParaRecoger = (datos: { nombre: string; marca: string; modelo: string; placas: string }) =>
  `Hola, ${datos.nombre}. Tu ${datos.marca} ${datos.modelo} con placas ${formatoPlaca(datos.placas)} ` +
  `ya está listo para recoger en ${NOMBRE_TALLER}. ¡Te esperamos!`

// wa.me pide el número internacional sin «+»: a los 10 dígitos de México se les antepone la lada 52.
export function telefonoInternacional(telefono: string) {
  const digitos = telefono.replace(/\D/g, '')
  return !telefono.trim().startsWith('+') && digitos.length === 10 ? `52${digitos}` : digitos
}

export const enlaceWhatsApp = (telefono: string, mensaje: string) =>
  `https://wa.me/${telefonoInternacional(telefono)}?text=${encodeURIComponent(mensaje)}`
