import { ReactNode } from 'react';
import PromptProvider from './PromptContext';
import SettingProvider from './SettingContext';
import UploadFileProvider from './UploadFileContext';
import HistoryProvider from './HistoryContext';
import EditorProvider from './EditorContext';
import TemplatetProvider from './TemplateContext';
import { AppContextProvider } from './AppContext';

export default function ContextWrapper({ children }: { children: ReactNode }) {
    return (
      <>
        <AppContextProvider>
          <SettingProvider>
            <PromptProvider>
              <TemplatetProvider>
                <UploadFileProvider>
                  <HistoryProvider>
                    <EditorProvider>
                      {children}
                    </EditorProvider>
                  </HistoryProvider>
                </UploadFileProvider>
              </TemplatetProvider>
            </PromptProvider>
          </SettingProvider>
        </AppContextProvider>
      </>
    )
}