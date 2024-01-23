import { createContext, ReactNode, useState, useEffect, useRef } from 'react';
import {GeneratedCodeConfig} from '../types'
import {cloneDeep} from 'lodash';
import { v4 as uuidv4 } from 'uuid';
const InitTemplateData = {
    list: [
        {
            id: "",
            title: "",
            code: "",
            description: "",
            imageUrl: "",
            from: "cunstom",
            fromUrl: "",
            type: GeneratedCodeConfig.HTML_TAILWIND,
            fetchUrl: "",
        }
    ],
};

export const templateData =  {
    id: "",
    title: "",
    code: "",
    description: "",
    imageUrl: "",
    from: "cunstom",
    fromUrl: "",
    type: GeneratedCodeConfig.HTML_TAILWIND,
    fetchUrl: "",
}

export type TemplateType = {
    id: string;
    code: string;
    type: GeneratedCodeConfig,
    title: string;
    description?: string;
    imageUrl?: string;
    from?: string;
    fromUrl?: string;
    fetchUrl?: string;
}

interface templatetContextType {
    templateList: Array<TemplateType>,
    save: () => void;
    addTemplate: (templatet: TemplateType) => void;
    removeTemplate: (id: string) => void;
    getTemplateById: (id: string) => TemplateType | undefined;
}

const initialValue = {
    templateList: [],
    addTemplate: (templatet?: any) => {},
    removeTemplate: (id: string) => {},
    save: () => {},
    getTemplateById: (id: string) => {return {
        id: '',
        code: '',
        title: '',
        des: '',
        imageUrl: '',
        description: '',
        type: GeneratedCodeConfig.REACT_ANTD
    }},
};

export interface TemplateState{
    templatetList: Array<TemplateType>
}

export const templatetContext = createContext<templatetContextType>(initialValue);
export default function TemplatetProvider({ children }: { children: ReactNode }) {

    const [templateList, setTemplateList] = useState<TemplateType[]>([]);
    const didMountRef = useRef(false);

    useEffect(() => {
        let cookie = window.localStorage.getItem('templateData');
        if (cookie) {
            let cookieObject: TemplateState = JSON.parse(cookie);
            setTemplateList(cookieObject.templatetList);
        } 
        // else {
        //     setTemplateList(InitTemplateData.list);
        // }
    }, []);


    function addTemplate (template: TemplateType) {
        if (!template.imageUrl) {
            template.imageUrl = 'https://placehold.co/600x400/png'
        }
        if (!template.id) {
            template.id = uuidv4();
            setTemplateList((prevState) => {
                const newTemplatets = [...prevState, template];
                return newTemplatets;
            });
        } else {
            setTemplateList((prevState) => {
                const newTemplates = [...prevState]
                const curIndex = newTemplates.findIndex((curTemplate) => curTemplate.id === template.id);
                if (curIndex >= 0) {
                    newTemplates[curIndex] = template;
                }
                return newTemplates;
            });
        }
     
    }

    function removeTemplate(id: string) {
        setTemplateList((prevState) => {
            const newTemplates = [...prevState];
            const index = newTemplates.findIndex((template) => template.id === id);
            if (index >= 0) {
                newTemplates.splice(index, 1)
            }
            return newTemplates;
        });
    }


    function save() {
        let SaveTemplates = cloneDeep(templateList);
        if (SaveTemplates) {
          window.localStorage.setItem(
            'templateData',
            JSON.stringify({ templateList }),
          );
        }
    }

    function getTemplateById(id: string) {
        return templateList.find((template) => template.id === id);
    }

    useEffect(() => {
        if (didMountRef.current) {
            save();
        } else {
            didMountRef.current = true;
        }
        
      }, [templateList, setTemplateList]);

    return (
      <templatetContext.Provider
        value={{
            templateList,
            save,
            addTemplate,
            removeTemplate,
            getTemplateById,
        }}
      >
        {children}
      </templatetContext.Provider>
    );
}