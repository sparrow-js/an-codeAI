import { ReactNode } from 'react';
import PromptProvider from './PromptContext';
import SettingProvider from './SettingContext';
import UploadFileProvider from './UploadFileContext';
import HistoryProvider from './HistoryContext';
import EditorProvider from './EditorContext';

export default function ContextWrapper({ children }: { children: ReactNode }) {
    return (
      <>
        <SettingProvider>
          <PromptProvider>
            <UploadFileProvider>
              <HistoryProvider>
                <EditorProvider>
                  {children}
                </EditorProvider>
              </HistoryProvider>
            </UploadFileProvider>
          </PromptProvider>
        </SettingProvider>
      </>
    )
}