import { ReactNode } from 'react';
import PromptProvider from './PromptContext';
import SettingProvider from './SettingContext';
import UploadFileProvider from './UploadFileContext';
import HistoryProvider from './HistoryContext';
import EditorProvider from './EditorContext';
import TemplatetProvider from './TemplateContext';

export default function ContextWrapper({ children }: { children: ReactNode }) {
    return (
      <>
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
      </>
    )
}