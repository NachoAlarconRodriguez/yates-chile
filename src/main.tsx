import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { LanguageProvider } from './context/LanguageContext'
import { SiteContentProvider } from './context/SiteContentContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <SiteContentProvider>
        <App />
      </SiteContentProvider>
    </LanguageProvider>
  </StrictMode>,
)

