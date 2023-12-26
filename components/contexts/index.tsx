import { ReactNode } from 'react';
import PromptProvider from './PromptContext'

export default function ContextWrapper({ children }: { children: ReactNode }) {
    return (
      <>
        <PromptProvider>
            {children}
        </PromptProvider>
      </>
    )
}