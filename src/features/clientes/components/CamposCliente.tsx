import type { ErroresDeCampo } from '../../../shared/api/http'
import { CampoTexto } from '../../../shared/ui/Campo'
import type { ValorCliente } from './clienteFormulario'

interface Props {
  valor: ValorCliente
  alCambiar: (valor: ValorCliente) => void
  errores?: ErroresDeCampo
}

export function CamposCliente({ valor, alCambiar, errores = {} }: Props) {
  const actualizar = (cambios: Partial<ValorCliente>) => alCambiar({ ...valor, ...cambios })

  return (
    <div className="pila">
      <div className="rejilla-2">
        <CampoTexto
          etiqueta="Nombre"
          obligatorio
          maxLength={100}
          value={valor.nombre}
          onChange={(evento) => actualizar({ nombre: evento.target.value })}
          error={errores.nombre}
        />
        <CampoTexto
          etiqueta="Apellidos"
          maxLength={120}
          value={valor.apellidos}
          onChange={(evento) => actualizar({ apellidos: evento.target.value })}
          error={errores.apellidos}
        />
      </div>
      <div className="rejilla-2">
        <CampoTexto
          etiqueta="Teléfono (WhatsApp)"
          obligatorio
          type="tel"
          placeholder="418 000 0000"
          value={valor.telefono}
          onChange={(evento) => actualizar({ telefono: evento.target.value })}
          error={errores.telefono}
        />
        <CampoTexto
          etiqueta="Observaciones"
          value={valor.notas}
          onChange={(evento) => actualizar({ notas: evento.target.value })}
          error={errores.notas}
        />
      </div>
    </div>
  )
}
