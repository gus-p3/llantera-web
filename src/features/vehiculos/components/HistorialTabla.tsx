import { useNavigate } from 'react-router-dom'
import { EtiquetaEstado } from '../../../shared/ui/Etiquetas'
import { MenuFila } from '../../../shared/ui/MenuFila'
import { Tabla, type Columna } from '../../../shared/ui/Tabla'
import { fechaLarga, formatoNota } from '../../../shared/util/formato'
import type { PedidoResumen } from '../../pedidos/pedidos.api'

const COLUMNAS: Columna<PedidoResumen>[] = [
  { encabezado: 'Nota', celda: (pedido) => <span className="mono">{formatoNota(pedido.numeroNota)}</span> },
  { encabezado: 'Ingreso', celda: (pedido) => fechaLarga(pedido.fechaIngreso) },
  {
    encabezado: 'Salida',
    celda: (pedido) =>
      pedido.fechaSalida ? fechaLarga(pedido.fechaSalida) : <span className="texto-suave">— en curso</span>,
  },
  { encabezado: 'Servicio', celda: (pedido) => pedido.descripcion },
  { encabezado: 'Estado', celda: (pedido) => <EtiquetaEstado estado={pedido.estado.clave} /> },
]

export function HistorialTabla({ pedidos }: { pedidos: PedidoResumen[] }) {
  const navegar = useNavigate()
  return (
    <Tabla
      columnas={COLUMNAS}
      filas={pedidos}
      claveDe={(pedido) => pedido.id}
      vacio="Este vehículo aún no tiene servicios."
      menu={(pedido) => (
        <MenuFila
          etiqueta={`Acciones de la nota ${formatoNota(pedido.numeroNota)}`}
          opciones={[{ etiqueta: 'Ver detalle', alElegir: () => navegar(`/pedidos/${pedido.id}`) }]}
        />
      )}
    />
  )
}
