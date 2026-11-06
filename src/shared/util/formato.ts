const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const nombreCompleto = (persona: { nombre: string; apellidos: string | null }) =>
  [persona.nombre, persona.apellidos].filter(Boolean).join(' ')

// La placa se guarda sin guion (ABC123); el guion solo se muestra.
export function formatoPlaca(placa: string) {
  if (placa.length === 6 || placa.length === 7) return `${placa.slice(0, 3)}-${placa.slice(3)}`
  return placa
}

export const formatoNota = (numero: number) => String(numero).padStart(4, '0')

export function formatoTelefono(telefono: string) {
  const digitos = telefono.replace(/\D/g, '')
  if (digitos.length !== 10 || telefono.startsWith('+')) return telefono
  return `${digitos.slice(0, 3)} ${digitos.slice(3, 6)} ${digitos.slice(6)}`
}

// Las fechas llegan como 'YYYY-MM-DD'; se leen por partes para no recorrerlas por zona horaria.
function partesDeFecha(fecha: string) {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-').map(Number)
  return { anio, mes: MESES[mes - 1], dia }
}

export function fechaCorta(fecha: string | null) {
  if (!fecha) return '—'
  const { dia, mes } = partesDeFecha(fecha)
  return `${dia} ${mes}`
}

export function fechaLarga(fecha: string | null) {
  if (!fecha) return '—'
  const { dia, mes, anio } = partesDeFecha(fecha)
  return `${dia} ${mes} ${anio}`
}

export function mesYAnio(fechaHora: string) {
  const fecha = new Date(fechaHora)
  return `${MESES[fecha.getMonth()]} ${fecha.getFullYear()}`
}

export function hoyIso() {
  const hoy = new Date()
  const pad = (valor: number) => String(valor).padStart(2, '0')
  return `${hoy.getFullYear()}-${pad(hoy.getMonth() + 1)}-${pad(hoy.getDate())}`
}
