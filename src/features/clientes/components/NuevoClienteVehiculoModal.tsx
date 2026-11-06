import { useId, useState, type FormEvent } from 'react'
import type { ErrorHttp, ErroresDeCampo } from '../../../shared/api/http'
import { Banner } from '../../../shared/ui/Banner'
import { Boton } from '../../../shared/ui/Boton'
import { Modal } from '../../../shared/ui/Modal'
import { FormularioVehiculo } from '../../vehiculos/components/FormularioVehiculo'
import {
  validarVehiculo,
  valorAPeticion as vehiculoAPeticion,
  vehiculoVacio,
} from '../../vehiculos/components/vehiculoFormulario'
import type { Vehiculo } from '../../vehiculos/vehiculos.api'
import { crearClienteConVehiculo, type Cliente } from '../clientes.api'
import { CamposCliente } from './CamposCliente'
import { clienteVacio, validarCliente, valorAPeticion as clienteAPeticion } from './clienteFormulario'

interface Props {
  ayuda?: string
  alGuardar: (resultado: { cliente: Cliente; vehiculo: Vehiculo }) => void
  alCerrar: () => void
}

function camposConPrefijo(campos: ErroresDeCampo, prefijo: string) {
  const resultado: ErroresDeCampo = {}
  for (const [campo, mensaje] of Object.entries(campos)) {
    if (campo.startsWith(prefijo)) resultado[campo.slice(prefijo.length)] = mensaje
  }
  return resultado
}

// Registra cliente y vehículo en un solo paso. Se usa desde Clientes y desde Nuevo pedido; ver docs/Clientes.md.
export function NuevoClienteVehiculoModal({ ayuda, alGuardar, alCerrar }: Props) {
  const [cliente, setCliente] = useState(clienteVacio)
  const [vehiculo, setVehiculo] = useState(vehiculoVacio)
  const [erroresCliente, setErroresCliente] = useState<ErroresDeCampo>({})
  const [erroresVehiculo, setErroresVehiculo] = useState<ErroresDeCampo>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const idFormulario = useId()

  async function guardar(evento: FormEvent) {
    evento.preventDefault()
    evento.stopPropagation()
    const enCliente = validarCliente(cliente)
    const enVehiculo = validarVehiculo(vehiculo)
    setErroresCliente(enCliente)
    setErroresVehiculo(enVehiculo)
    setErrorGeneral(null)
    if (Object.keys(enCliente).length + Object.keys(enVehiculo).length > 0) return

    setGuardando(true)
    try {
      alGuardar(await crearClienteConVehiculo(clienteAPeticion(cliente), vehiculoAPeticion(vehiculo)))
    } catch (causa) {
      const error = causa as ErrorHttp
      const campos = error.campos ?? {}
      if (error.codigo === 'PLACA_DUPLICADA') {
        setErroresVehiculo({ placas: error.message })
      } else if (Object.keys(campos).length > 0) {
        setErroresCliente(camposConPrefijo(campos, 'cliente.'))
        setErroresVehiculo(camposConPrefijo(campos, 'vehiculo.'))
      } else {
        setErrorGeneral(error.message)
      }
      setGuardando(false)
    }
  }

  return (
    <Modal
      titulo="Nuevo cliente"
      ancho="amplio"
      alCerrar={alCerrar}
      pie={
        <>
          {ayuda && <span className="texto-suave">{ayuda}</span>}
          <Boton onClick={alCerrar}>Cancelar</Boton>
          <Boton variante="principal" type="submit" form={idFormulario} disabled={guardando}>
            Guardar cliente y vehículo
          </Boton>
        </>
      }
    >
      <form id={idFormulario} className="pila" onSubmit={guardar} noValidate>
        {errorGeneral && <Banner tipo="error">{errorGeneral}</Banner>}
        <h3 className="titulo-seccion">Datos del cliente</h3>
        <CamposCliente valor={cliente} alCambiar={setCliente} errores={erroresCliente} />
        <h3 className="titulo-seccion">Vehículo del cliente</h3>
        <FormularioVehiculo valor={vehiculo} alCambiar={setVehiculo} errores={erroresVehiculo} />
      </form>
    </Modal>
  )
}
