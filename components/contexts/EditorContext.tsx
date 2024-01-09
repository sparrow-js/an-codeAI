import { createContext, ReactNode, useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';

interface editorContextType {
    enableEdit: boolean;
    setEnableEdit: Dispatch<SetStateAction<boolean>>
}

const initialValue = {
    enableEdit: true,
    setEnableEdit: (value: SetStateAction<boolean>) => {},
}

export const EditorContext = createContext<editorContextType>(initialValue);

export default function EditorProvider({ children }: { children: ReactNode }) {
   const [enableEdit, setEnableEdit] = useState<boolean>(true);

    return (
        <EditorContext.Provider
          value={{
            enableEdit,
            setEnableEdit
          }}
        >
          {children}
        </EditorContext.Provider>
    );
}