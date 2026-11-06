import { useId, useState, type FormEvent } from 'react'
import { ErrorHttp, type ErroresDeCampo } from '../../../shared/api/http'
import { Banner } from '../../../shared/ui/Banner'
import { Boton } from '../../../shared/ui/Boton'
import { Modal } from '../../../shared/ui/Modal'
import { actualizarVehiculo, crearVehiculo, type Vehiculo } from '../vehiculos.api'
import { FormularioVehiculo } from './FormularioVehiculo'
import { validarVehiculo, valorAPeticion, vehiculoAValor, vehiculoVacio } from './vehiculoFormulario'

type Props = {
  alGuardar: (vehiculo: Vehiculo) => void
  alCerrar: () => void
} & ({ idCliente: number; vehiculo?: never } | { vehiculo: Vehiculo; idCliente?: never })

// Con idCliente agrega un vehículo a ese cliente; con vehiculo lo edita.
export function VehiculoModal({ idCliente, vehiculo, alGuardar, alCerrar }: Props) {
  const [valor, setValor] = useState(() => (vehiculo ? vehiculoAValor(vehiculo) : vehiculoVacio()))
  const [errores, setErrores] = useState<ErroresDeCampo>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const idFormulario = useId()

  async function guardar(evento: FormEvent) {
    evento.preventDefault()
    evento.stopPropagation()
    const encontrados = validarVehiculo(valor)
    setErrores(encontrados)
    setErrorGeneral(null)
    if (Object.keys(encontrados).length > 0) return

    setGuardando(true)
    try {
      const datos = valorAPeticion(valor)
      alGuardar(vehiculo ? await actualizarVehiculo(vehiculo.id, datos) : await crearVehiculo(idCliente, datos))
    } catch (causa) {
      const error = causa as ErrorHttp
      if (error.codigo === 'PLACA_DUPLICADA') setErrores({ placas: error.message })
      else if (Object.keys(error.campos ?? {}).length > 0) setErrores(error.campos)
      else setErrorGeneral(error.message)
      setGuardando(false)
    }
  }

  return (
    <Modal
      titulo={vehiculo ? 'Editar vehículo' : 'Agregar vehículo'}
      ancho="amplio"
      alCerrar={alCerrar}
      pie={
        <>
          <Boton onClick={alCerrar}>Cancelar</Boton>
          <Boton variante="principal" type="submit" form={idFormulario} disabled={guardando}>
            Guardar vehículo
          </Boton>
        </>
      }
    >
      <form id={idFormulario} className="pila" onSubmit={guardar} noValidate>
        {errorGeneral && <Banner tipo="error">{errorGeneral}</Banner>}
        <FormularioVehiculo valor={valor} alCambiar={setValor} errores={errores} />
      </form>
    </Modal>
  )
}
