import React from 'react'
import App from './App'
import { Toaster } from "react-hot-toast";

export default function Draw() {
 return (
  <>
    <App />
    <Toaster toastOptions={{ className:"dark:bg-zinc-950 dark:text-white" }}/>
  </>
 )
}