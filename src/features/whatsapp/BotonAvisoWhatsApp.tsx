import { MessageCircle } from 'lucide-react'
import { enlaceWhatsApp, mensajeListoParaRecoger } from './whatsapp'

interface Props {
  cliente: { nombre: string; telefono: string }
  vehiculo: { marca: string; modelo: string; placas: string }
}

// No envía nada: abre WhatsApp con el texto escrito y la secretaria lo manda desde su cuenta.
export function BotonAvisoWhatsApp({ cliente, vehiculo }: Props) {
  const mensaje = mensajeListoParaRecoger({ nombre: cliente.nombre, ...vehiculo })
  return (
    <a
      className="boton boton-principal"
      href={enlaceWhatsApp(cliente.telefono, mensaje)}
      target="_blank"
      rel="noopener noreferrer"
    >
      <MessageCircle size={16} aria-hidden="true" />
      Preparar aviso de WhatsApp
    </a>
  )
}
