import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.tsx'
import { LanguageProvider } from './context/LanguageContext'
import { SiteContentProvider } from './context/SiteContentContext'
import { ExpeditionsProvider } from './context/ExpeditionsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <SiteContentProvider>
        <ExpeditionsProvider>
          <App />
        </ExpeditionsProvider>
      </SiteContentProvider>
    </LanguageProvider>
  </StrictMode>,
)

