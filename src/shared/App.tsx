import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CambiarPasswordPage } from '../features/auth/CambiarPasswordPage'
import { LoginPage } from '../features/auth/LoginPage'
import { ClienteDetallePage } from '../features/clientes/ClienteDetallePage'
import { ClientesPage } from '../features/clientes/ClientesPage'
import { InicioPage } from '../features/inicio/InicioPage'
import { EditarPedidoPage, NuevoPedidoPage } from '../features/pedidos/NuevoPedidoPage'
import { PedidoDetallePage } from '../features/pedidos/PedidoDetallePage'
import { PedidosPage } from '../features/pedidos/PedidosPage'
import { PromocionesPage } from '../features/promociones/PromocionesPage'
import { VehiculoDetallePage } from '../features/vehiculos/VehiculoDetallePage'
import { VehiculosPage } from '../features/vehiculos/VehiculosPage'
import { RutaProtegida } from './auth/RutaProtegida'
import { SesionProveedor } from './auth/SesionProveedor'
import { Layout } from './layout/Layout'
import { MuestraUiPage } from './ui/MuestraUiPage'

export function App() {
  return (
    <BrowserRouter>
      <SesionProveedor>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cambiar-password" element={<CambiarPasswordPage />} />
          <Route element={<RutaProtegida />}>
            <Route element={<Layout />}>
              <Route index element={<InicioPage />} />
              <Route path="pedidos" element={<PedidosPage />} />
              <Route path="pedidos/nuevo" element={<NuevoPedidoPage />} />
              <Route path="pedidos/:id" element={<PedidoDetallePage />} />
              <Route path="pedidos/:id/editar" element={<EditarPedidoPage />} />
              <Route path="clientes" element={<ClientesPage />} />
              <Route path="clientes/:id" element={<ClienteDetallePage />} />
              <Route path="vehiculos" element={<VehiculosPage />} />
              <Route path="vehiculos/:id" element={<VehiculoDetallePage />} />
              <Route path="promociones" element={<PromocionesPage />} />
              <Route path="muestra-ui" element={<MuestraUiPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SesionProveedor>
    </BrowserRouter>
  )
}
