import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '@fontsource/roboto-mono/400.css'
import '@fontsource/roboto-mono/700.css'
import './shared/styles/tokens.css'
import './shared/styles/base.css'
import './shared/ui/ui.css'
import { App } from './shared/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
