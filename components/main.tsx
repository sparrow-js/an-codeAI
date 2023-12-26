import React from 'react'
import App from './App'
import { Toaster } from "react-hot-toast";
import ContextWrapper from './contexts';

export default function Draw() {
 return (
  <>
    <ContextWrapper>
      <App />
    </ContextWrapper>
    <Toaster toastOptions={{ className:"dark:bg-zinc-950 dark:text-white" }}/>
  </>
 )
}
