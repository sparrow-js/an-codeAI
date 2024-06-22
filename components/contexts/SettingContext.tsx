import { createContext, ReactNode, useState, useEffect, useRef } from 'react';
import {GeneratedCodeConfig, EditorTheme, Settings} from '../types'

interface settingContextType {
    settings: Settings;
    setSettings: (newState: Settings) => void;
    initCreate: boolean;
    setInitCreate: (newState: boolean) => void;
    initCreateText: string;
    setInitCreateText: (newState: string) => void;
}

const initialValue = {
    settings: {
        openAiApiKey: '',
        openAiBaseURL: null,
        screenshotOneApiKey: null,
        isImageGenerationEnabled: true,
        editorTheme: EditorTheme.COBALT,
        generatedCodeConfig: GeneratedCodeConfig.HTML_TAILWIND,
        // Only relevant for hosted version
        isTermOfServiceAccepted: false,
        accessCode: null,
        mockAiResponse: false,
        promptCode: '',
        init: false,
        llm: 'openai',
        geminiApiKey: '',
        anthropicApiKey: '',
        anthropicBaseURL: null
    },
    initCreate: false,
    setSettings: () => {},
    setInitCreate: (newState: boolean) => {},
        initCreateText: '',
    setInitCreateText: (newState: string) => {},
}

export const SettingContext = createContext<settingContextType>(initialValue);

export default function SettingProvider({ children }: { children: ReactNode }) {
    const [settings, setSettingsStatus] = useState<Settings>(initialValue.settings);
    const [first, setFirst] = useState<boolean>(true);
    const [initCreate, setInitCreateStatus] = useState<boolean>(false);
    const [initCreateText, setInitCreateTextStatus] = useState<string>('');

    function setSettings(newState: Settings) {
        setSettingsStatus(newState);
    }

    useEffect(() => {
        if (first) {
            const value = window.localStorage.getItem('setting');
            const initCreateTextValue = window.localStorage.getItem('initCreateText');
            if (value) {
                const valueObj = JSON.parse(value)
                valueObj.init = true;
                setSettingsStatus(valueObj);
            }

            if (initCreateTextValue) {
                const valueObj = JSON.parse(initCreateTextValue);
                if (valueObj && valueObj.initCreateText) {
                    setInitCreateTextStatus(valueObj.initCreateText);
                }
            }

            setFirst(false);
        } else {
            window.localStorage.setItem('setting', JSON.stringify(settings));
            window.localStorage.setItem('initCreateText', JSON.stringify({
                initCreateText,
            }));

        }
    }, [
        settings,
        first,
        initCreateText,
    ]);

    function setInitCreate (newState: boolean) {
        setInitCreateStatus(newState)
    }

    function setInitCreateText(newState: string) {
        setInitCreateTextStatus(newState);
    }

    return (
        <SettingContext.Provider
          value={{
            settings,
            setSettings,
            initCreate,
            setInitCreate,
            initCreateText,
            setInitCreateText,
          }}
        >
          {children}
        </SettingContext.Provider>
    );
}