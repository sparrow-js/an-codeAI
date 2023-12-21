import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './mloader.ts'
import { Toaster } from "react-hot-toast";
import ContextWrapper from './contexts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ContextWrapper>
      <App />
    </ContextWrapper>
    <Toaster toastOptions={{ className:"dark:bg-zinc-950 dark:text-white" }}/>
  </React.StrictMode>,
)
