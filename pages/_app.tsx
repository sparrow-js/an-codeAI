import '@/styles/globals.css'
import './index.css';
import type { AppProps } from 'next/app'
import ContextWrapper from '../components/contexts';

export default function App({ Component, pageProps }: AppProps) {
  return <>
    <ContextWrapper>
      <Component {...pageProps} />
    </ContextWrapper>
  </>
}
