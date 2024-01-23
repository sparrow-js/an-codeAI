import { 
    createContext, 
    ReactNode, 
    useState, 
    useEffect, 
    useRef, 
    SetStateAction,
    Dispatch,
    useContext
} from 'react';
import {GeneratedCodeConfig} from '../types'
import {cloneDeep} from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { useDebounceFn } from 'ahooks';


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
    title?: string;
    description?: string;
    imageUrl?: string;
    from?: string;
    fromUrl?: string;
    fetchUrl?: string;
}

interface templatetContextType {
    templateList: Array<TemplateType>,
    debugTemplate: TemplateType,
    setDebugTemplate: Dispatch<SetStateAction<TemplateType>>
    save: () => void;
    addTemplate: (templatet: TemplateType) => void;
    removeTemplate: (id: string) => void;
    getTemplateById: (id: string) => TemplateType | undefined;
}

const initialValue = {
    templateList: [],
    debugTemplate: {
        id: "",
        code: "",
        type: GeneratedCodeConfig.HTML_TAILWIND,
    },
    setDebugTemplate: (value: SetStateAction<TemplateType>) => {},
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
    templateList: Array<TemplateType>
}

export const TemplateContext = createContext<templatetContextType>(initialValue);
export default function TemplatetProvider({ children }: { children: ReactNode }) {

    const [templateList, setTemplateList] = useState<TemplateType[]>([]);
    const didMountRef = useRef(false);
    const [debugTemplate, setDebugTemplate] = useState<TemplateType>({
        id: "",
        code: "",
        type: GeneratedCodeConfig.HTML_TAILWIND,
    });

    useEffect(() => {
        let cookie = window.localStorage.getItem('templateData');
        if (cookie) {
            let cookieObject: TemplateState = JSON.parse(cookie);
            cookieObject.templateList && setTemplateList(cookieObject.templateList);
        }
    }, []);


    function addTemplate (template: TemplateType) {
        if (!template.imageUrl) {
            template.imageUrl = 'https://www.ancodeai.com/placeholder.svg'
        }
     
        setTemplateList((prevState) => {
            const newTemplates = [...prevState]
            const curIndex = newTemplates.findIndex((curTemplate) => curTemplate.id === template.id);
            if (curIndex >= 0) {
                newTemplates[curIndex] = template;
            } else {
                template.id = uuidv4();
                newTemplates.push(template);
            }
            return newTemplates;
        });
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
        if (didMountRef.current === false) {
            didMountRef.current = true;
            return;
        }
        let SaveTemplates = cloneDeep(templateList);
        if (SaveTemplates) {
          window.localStorage.setItem(
            'templateData',
            JSON.stringify({ templateList }),
          );
        }
    }

    const saveDebounce = useDebounceFn(save, {
        wait: 300
    });

    function getTemplateById(id: string) {
        return templateList.find((template) => template.id === id);
    }

    useEffect(() => {
        saveDebounce.run();
      }, [templateList, setTemplateList]);

    return (
      <TemplateContext.Provider
        value={{
            templateList,
            debugTemplate,
            setDebugTemplate,
            save,
            addTemplate,
            removeTemplate,
            getTemplateById,
        }}
      >
        {children}
      </TemplateContext.Provider>
    );
}