import { createContext, ReactNode, useState, useEffect, useRef } from 'react';
import { History, HistoryItem } from "../components/history/history_types";
import toast from "react-hot-toast";

interface historyContextType {
    history: History;
    currentVersion: number | null;
    setCurrentVersion: (version: number | null) => void;
    addHistory: (
      generationType: string, 
      updateInstruction: string, 
      referenceImages: string[], 
      initText: string, 
      code: string,
      originMessage: string,
    ) => void;
    updateHistoryScreenshot: (img: string, version?: number) => void;
    updateHistoryCode: (img: string, version?: number) => void;
    resetHistory: () => void;
}

const initialValue = {
    history: [],
    currentVersion: null,
    setCurrentVersion: (version: number | null) => {},
    addHistory: (generationType: string, updateInstruction: string, referenceImages: string[], initText: string, code: string) => {},
    updateHistoryScreenshot: (img: string, version?: number) => {},
    updateHistoryCode: (img: string, version?: number) => {},
    resetHistory: () => {}
}

export const HistoryContext = createContext<historyContextType>(initialValue);

export default function SettingProvider({ children }: { children: ReactNode }) {
    const [history , setHistory] = useState<History>([]);
    let [currentVersion, setCurrentVersionStatus] = useState<number | null>(null);

    function addHistory (generationType: string, updateInstruction: string, referenceImages: string[], initText: string, code: string, originMessage: string) {
        if (generationType === "create") {
            setHistory([
              {
                type: "ai_create",
                parentIndex: null,
                code,
                inputs: { 
                  image_url: referenceImages[0],
                  initText,
                  originMessage
                },
              },
            ]);
            setCurrentVersionStatus(0);
          } else {
            setHistory((prev) => {
              // Validate parent version
              if (currentVersion === null) {
                toast.error(
                  "No parent version set. Contact support or open a Github issue."
                );
                return prev;
              }
  
              const newHistory: History = [
                ...prev,
                {
                  type: "ai_edit",
                  parentIndex: currentVersion,
                  code,
                  inputs: {
                    prompt: updateInstruction,
                    originMessage,
                  },
                },
              ];
              setCurrentVersionStatus(newHistory.length - 1);
              return newHistory;
            });
        }
    }
    const updateHistoryScreenshot = (img: string, version?: number) => {

      setHistory((prevState) => {
          const newHistory = [...prevState];
          const index = version || currentVersion || 0;
          if (index !== -1 && newHistory && newHistory[index] && !newHistory[index].isLock) {
            newHistory[index].screenshot = img;
            newHistory[index].isLock = true;
          }
          return newHistory;
        });
    }

    const updateHistoryCode = (code: string, version?: number) => {
      setHistory((prevState) => {
          const newHistory = [...prevState];
          const index = version || currentVersion || 0;
          if (index !== -1 && newHistory && newHistory[index]) {
            newHistory[index].code = code;
          }
          return newHistory;
        });
    }
   

    function setCurrentVersion(version: number | null) {
        currentVersion = version;
        setCurrentVersionStatus(version)
    }

    function resetHistory() {
      setHistory([]);
      setCurrentVersionStatus(0);
    }

    return (
        <HistoryContext.Provider
          value={{
            history,
            currentVersion,
            setCurrentVersion,
            addHistory,
            updateHistoryScreenshot,
            resetHistory,
            updateHistoryCode
          }}
        >
          {children}
        </HistoryContext.Provider>
    );
}