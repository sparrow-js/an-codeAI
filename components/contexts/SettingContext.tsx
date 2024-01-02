import { createContext, ReactNode, useState, useEffect, useRef } from 'react';
import {GeneratedCodeConfig, EditorTheme, Settings} from '../types'

interface settingContextType {
    settings: Settings;
    setSettings: (newState: Settings) => void;
}

const initialValue = {
    settings: {
        openAiApiKey: null,
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
    },
    setSettings: () => {},
}

export const SettingContext = createContext<settingContextType>(initialValue);

export default function SettingProvider({ children }: { children: ReactNode }) {
    const [settings, setSettingsStatus] = useState<Settings>(initialValue.settings);
    const [first, setFirst] = useState<boolean>(true);

    function setSettings(newState: Settings) {
        setSettingsStatus(newState);
    }

    useEffect(() => {
        if (first) {
            const value = window.localStorage.getItem('setting');
            if (value) {
                const valueObj = JSON.parse(value)
                valueObj.init = true;
                setSettingsStatus(valueObj);
            }
            setFirst(false);
        } else {
            window.localStorage.setItem('setting', JSON.stringify(settings));
        }
    }, [
        settings,
        first
    ]);

    return (
        <SettingContext.Provider
          value={{
            settings,
            setSettings
          }}
        >
          {children}
        </SettingContext.Provider>
    );
}