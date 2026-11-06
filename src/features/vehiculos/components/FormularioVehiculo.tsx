import type { ErroresDeCampo } from '../../../shared/api/http'
import { Autocompletar } from '../../../shared/ui/Autocompletar'
import { CampoArea, CampoTexto } from '../../../shared/ui/Campo'
import { listarMarcas, type Marca } from '../../marcas/marcas.api'
import type { ValorVehiculo } from './vehiculoFormulario'

interface Props {
  valor: ValorVehiculo
  alCambiar: (valor: ValorVehiculo) => void
  errores?: ErroresDeCampo
}

// Formulario controlado, para crear y para editar. Se importa; no se copia. Ver docs/Vehiculos.md.
export function FormularioVehiculo({ valor, alCambiar, errores = {} }: Props) {
  const actualizar = (cambios: Partial<ValorVehiculo>) => alCambiar({ ...valor, ...cambios })

  return (
    <div className="pila">
      <div className="rejilla-3">
        <Autocompletar<Marca>
          etiqueta="Marca"
          obligatorio
          texto={valor.marca}
          alCambiarTexto={(marca) => actualizar({ marca, idMarca: null })}
          buscar={listarMarcas}
          alElegir={(marca) => actualizar({ marca: marca.nombre, idMarca: marca.id })}
          claveDe={(marca) => marca.id}
          mostrar={(marca) => marca.nombre}
          error={errores.marca}
        />
        <CampoTexto
          etiqueta="Modelo"
          obligatorio
          maxLength={80}
          value={valor.modelo}
          onChange={(evento) => actualizar({ modelo: evento.target.value })}
          error={errores.modelo}
        />
        <CampoTexto
          etiqueta="Año"
          inputMode="numeric"
          maxLength={4}
          value={valor.anio}
          onChange={(evento) => actualizar({ anio: evento.target.value })}
          error={errores.anio}
        />
      </div>
      <div className="rejilla-2">
        <CampoTexto
          etiqueta="Color"
          maxLength={40}
          value={valor.color}
          onChange={(evento) => actualizar({ color: evento.target.value })}
          error={errores.color}
        />
        <CampoTexto
          etiqueta="Placa"
          obligatorio
          mono
          placeholder="ABC-123"
          maxLength={20}
          value={valor.placas}
          onChange={(evento) => actualizar({ placas: evento.target.value.toUpperCase() })}
          error={errores.placas}
        />
      </div>
      <CampoArea
        etiqueta="Notas del vehículo"
        rows={2}
        value={valor.notas}
        onChange={(evento) => actualizar({ notas: evento.target.value })}
        error={errores.notas}
      />
    </div>
  )
}
