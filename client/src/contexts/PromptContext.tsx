import { createContext, ReactNode, useState, useEffect, useRef } from 'react';
import {GeneratedCodeConfig} from '../types'
import {cloneDeep} from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import InitPromptData from '../promptdata';

export type PromptType = {
    id: string;
    name: string;
    des: string;
    imgUrl: string;
    prompt: string;
    type: GeneratedCodeConfig
}

interface locationContextType {
    promptList: Array<PromptType>,
    save: () => void;
    addPrompt: (prompt: PromptType) => void;
    removePrompt: (id: string) => void;
    getPromptById: (id: string) => PromptType | undefined;
}

const initialValue = {
    promptList: [],
    addPrompt: (prompt?: any) => {},
    removePrompt: (id: string) => {},
    save: () => {},
    getPromptById: (id: string) => {return {
        id: '',
        name: '',
        des: '',
        imgUrl: '',
        prompt: '',
        type: GeneratedCodeConfig.REACT_ANTD
    }},
};

export interface PromptState{
    promptList: Array<PromptType>
}

export const promptContext = createContext<locationContextType>(initialValue);
export function PromptProvider({ children }: { children: ReactNode }) {

    const [promptList, setPromptList] = useState<PromptType[]>([]);
    const didMountRef = useRef(false);

    useEffect(() => {
        let cookie = window.localStorage.getItem('promptData');
        if (cookie) {
            let cookieObject: PromptState = JSON.parse(cookie);
            setPromptList(cookieObject.promptList);
        } else {
            setPromptList(InitPromptData.promptList);
        }
    }, []);


    function addPrompt (prompt: PromptType) {
        if (!prompt.imgUrl) {
            prompt.imgUrl = 'https://placehold.co/600x400/png'
        }
        if (!prompt.id) {
            prompt.id = uuidv4();
            setPromptList((prevState) => {
                const newPrompts = [...prevState, prompt];
                return newPrompts;
            });
        } else {
            setPromptList((prevState) => {
                const newPrompts = [...prevState]
                const curIndex = newPrompts.findIndex((curPrompt) => curPrompt.id === prompt.id);
                if (curIndex >= 0) {
                    newPrompts[curIndex] = prompt;
                }
                return newPrompts;
            });
        }
     
    }

    function removePrompt(id: string) {
        setPromptList((prevState) => {
            const newPrompts = [...prevState];
            const index = newPrompts.findIndex((prompt) => prompt.id === id);
            if (index >= 0) {
                newPrompts.splice(index, 1)
            }
            return newPrompts;
        });
    }


    function save() {
        let SavePrompts = cloneDeep(promptList);
        if (SavePrompts) {
          window.localStorage.setItem(
            'promptData',
            JSON.stringify({ promptList }),
          );
        }
    }

    function getPromptById(id: string) {
        return promptList.find((prompt) => prompt.id === id);
    }

    useEffect(() => {
        if (didMountRef.current) {
            save();
        } else {
            didMountRef.current = true;
        }
        
      }, [promptList, setPromptList]);

    return (
      <promptContext.Provider
        value={{
            promptList,
            save,
            addPrompt,
            removePrompt,
            getPromptById,
        }}
      >
        {children}
      </promptContext.Provider>
    );
}