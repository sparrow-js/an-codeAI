import '@/styles/globals.css'
import './index.css';
import type { AppProps } from 'next/app'
import ContextWrapper from '../components/contexts';
import { ClerkProvider } from "@clerk/nextjs";

export default function App({ Component, pageProps }: AppProps) {
  return <>
   <ClerkProvider>
    <ContextWrapper>
        <Component {...pageProps} />
      </ContextWrapper>
   </ClerkProvider>
  </>
}
