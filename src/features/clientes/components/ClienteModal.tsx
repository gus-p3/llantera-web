import { useId, useState, type FormEvent } from 'react'
import type { ErrorHttp, ErroresDeCampo } from '../../../shared/api/http'
import { Banner } from '../../../shared/ui/Banner'
import { Boton } from '../../../shared/ui/Boton'
import { Modal } from '../../../shared/ui/Modal'
import { actualizarCliente, type Cliente } from '../clientes.api'
import { CamposCliente } from './CamposCliente'
import { clienteAValor, validarCliente, valorAPeticion } from './clienteFormulario'

interface Props {
  cliente: Cliente
  alGuardar: (cliente: Cliente) => void
  alCerrar: () => void
}

export function ClienteModal({ cliente, alGuardar, alCerrar }: Props) {
  const [valor, setValor] = useState(() => clienteAValor(cliente))
  const [errores, setErrores] = useState<ErroresDeCampo>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const idFormulario = useId()

  async function guardar(evento: FormEvent) {
    evento.preventDefault()
    const encontrados = validarCliente(valor)
    setErrores(encontrados)
    setErrorGeneral(null)
    if (Object.keys(encontrados).length > 0) return

    setGuardando(true)
    try {
      alGuardar(await actualizarCliente(cliente.id, valorAPeticion(valor)))
    } catch (causa) {
      const error = causa as ErrorHttp
      if (Object.keys(error.campos ?? {}).length > 0) setErrores(error.campos)
      else setErrorGeneral(error.message)
      setGuardando(false)
    }
  }

  return (
    <Modal
      titulo="Editar cliente"
      ancho="amplio"
      alCerrar={alCerrar}
      pie={
        <>
          <Boton onClick={alCerrar}>Cancelar</Boton>
          <Boton variante="principal" type="submit" form={idFormulario} disabled={guardando}>
            Guardar cliente
          </Boton>
        </>
      }
    >
      <form id={idFormulario} className="pila" onSubmit={guardar} noValidate>
        {errorGeneral && <Banner tipo="error">{errorGeneral}</Banner>}
        <CamposCliente valor={valor} alCambiar={setValor} errores={errores} />
      </form>
    </Modal>
  )
}
