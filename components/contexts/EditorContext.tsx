import { createContext, ReactNode, useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';

export enum deviceType {
  'PC' = 'pc',
  'MOBILE' = 'mobile',
}

interface editorContextType {
    enableEdit: boolean;
    setEnableEdit: Dispatch<SetStateAction<boolean>>;
    device: deviceType;
    setDevice: Dispatch<SetStateAction<deviceType>>;
}

const initialValue = {
    enableEdit: true,
    setEnableEdit: (value: SetStateAction<boolean>) => {},
    device: deviceType.PC,
    setDevice: (value: SetStateAction<deviceType>) => {},
    
}

export const EditorContext = createContext<editorContextType>(initialValue);

export default function EditorProvider({ children }: { children: ReactNode }) {
   const [enableEdit, setEnableEdit] = useState<boolean>(true);
   const [device, setDevice] = useState<deviceType>(deviceType.PC);
    return (
        <EditorContext.Provider
          value={{
            enableEdit,
            setEnableEdit,
            device,
            setDevice
          }}
        >
          {children}
        </EditorContext.Provider>
    );
}