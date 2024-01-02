import { ReactNode } from 'react';
import PromptProvider from './PromptContext';
import SettingProvider from './SettingContext';
import UploadFileProvider from './UploadFileContext';
import HistoryProvider from './HistoryContext';

export default function ContextWrapper({ children }: { children: ReactNode }) {
    return (
      <>
        <SettingProvider>
          <PromptProvider>
            <UploadFileProvider>
              <HistoryProvider>
                {children}
              </HistoryProvider>
            </UploadFileProvider>
          </PromptProvider>
        </SettingProvider>
      </>
    )
}