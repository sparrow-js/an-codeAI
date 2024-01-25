import { Settings } from "../types";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import {useContext, useState} from 'react';
import {TemplateContext, TemplateType} from '../contexts/TemplateContext'
import {GeneratedCodeConfig} from '../types'
import { cloneDeep } from "lodash";
import { FaTrashAlt, FaHammer } from "react-icons/fa";
import classNames from "classnames";
import { useEffect } from "react";
import { toast } from "react-hot-toast";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "./ui/select"
import {TechnologyStackList} from './OutputSettingsSection';
import { Button } from "./ui/button";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/router';
import { FaEdit, FaRegEdit } from "react-icons/fa";
import { VscDebugAll } from "react-icons/vsc";


interface Props {
    settings: Settings;
    setSettings: (newState: Settings) => void;
}

function TemplatePanel({settings, setSettings}: Props) {
    const { 
        templateList,
        addTemplate, 
        getTemplateById, 
        removeTemplate,
        setDebugTemplate,
    } = useContext(TemplateContext);
    const initTemplate = {
        id: "",
        title: "",
        code: "",
        description: "",
        imageUrl: "",
        from: "cunstom",
        fromUrl: "",
        type: settings?.generatedCodeConfig,
        fetchUrl: "",
    }
    const [template, setTemplate] = useState<TemplateType>(cloneDeep(initTemplate));
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [mode, setMode] = useState<'debug'|'add'>('add');

    const router = useRouter();
    

    async function addTemplateHanler() {
        if (!template.code) {
            toast.error('enter template')
            return;
        }
        addTemplate(template);
        setTemplate(cloneDeep(initTemplate));
    }

    async function debugHandler() {
        template.id = uuidv4();
        if (!template.code) return;
        setDebugTemplate(template);
        setSettings({
            ...settings,
            generatedCodeConfig: template.type
        })
        router.push(`/editor/debug-${template.id}`);
    }

    const updatePromptHandler = (e: any, id: string) => {
        e.stopPropagation();
        setShowDialog(true);
        const template = getTemplateById(id);
        template && setTemplate(template);
    }
    
    return (
        <>
            <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col hover:ring ring-black relative border h-full relative">
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    {
                        !templateList.length && (
                            <DialogTrigger
                                className="w-full h-full bg-white rounded-lg flex justify-center items-center flex-col"
                                onClick={() => {
                                    setMode('add');
                                }}
                            >   
                                <a 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setShowDialog(true);
                                        setMode('debug')
                                    }}
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 mb-6"
                                >
                                    debug template
                                </a>
                                <div>
                                    + Add own template
                                </div>
                            </DialogTrigger>
                        )
                    }
                  
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="mb-4">template</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col space-y-4">
                            <Label htmlFor="">
                                <div>stack</div>
                            </Label>
                            <Select 
                                defaultValue={template.type || settings?.generatedCodeConfig}
                                onValueChange={(value: GeneratedCodeConfig) => {
                                    setTemplate((s) => ({
                                        ...s,
                                        type: value,
                                    }));
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a stack" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                    <SelectLabel>stack</SelectLabel>
                                        {TechnologyStackList.map((stack) => {
                                            return (
                                                <SelectItem key={stack.label} value={stack.label}>{stack.value}</SelectItem>
                                            )
                                        })}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <Label htmlFor="importcode">
                                <div>import code</div>
                            </Label>
                            <Textarea
                                className="h-40"
                                id="importcode"
                                placeholder="import code"
                                value={template.code}
                                onChange={(e) => {
                                    setTemplate((s) => ({
                                        ...s,
                                        code: e.target.value,
                                    }));
                                }}
                            ></Textarea>
                        </div>
                        {
                            mode === 'add' && (
                                <>
                                <div className="flex flex-col space-y-4">
                                    <Label htmlFor="name">
                                        <div>name</div>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="name"
                                        value={template.title}
                                        onChange={(e) => {
                                            setTemplate((s) => ({
                                                ...s,
                                                title: e.target.value,
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col space-y-4">
                                    <Label htmlFor="des">
                                        <div>des</div>
                                    </Label>
                                    <Input
                                        id="des"
                                        placeholder="des"
                                        value={template.description}
                                        onChange={(e) => {
                                            setTemplate((s) => ({
                                                ...s,
                                                description: e.target.value,
                                            }));
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col space-y-4">
                                    <Label htmlFor="img-url">
                                        <div>image url</div>
                                    </Label>
                                    <Input
                                        id="img-url"
                                        placeholder="img url"
                                        value={template.imageUrl}
                                        onChange={(e) => {
                                            setTemplate((s) => ({
                                                ...s,
                                                imageUrl: e.target.value,
                                            }));
                                        }}
                                    />
                                </div>
                                <DialogFooter>
                                    <DialogClose>
                                        <a 
                                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 mb-4"
                                            onClick={addTemplateHanler}
                                        >
                                            Save
                                        </a>
                                    </DialogClose>
                                </DialogFooter>
                                </>
                            )
                        }

                        {
                            mode === 'debug' && (
                                <>
                                <DialogFooter>
                                    <DialogClose>
                                        <a
                                            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 mb-4"
                                            onClick={debugHandler}
                                        >debug</a>
                                    </DialogClose>
                                </DialogFooter>
                                </>
                            )
                        }
                       
                    </DialogContent>
                </Dialog>
                {
                    templateList.map((item) => {
                        return (
                            <div onClick={() => {
                                setSettings({
                                    ...settings,
                                        generatedCodeConfig: item.type,
                                    });
                                router.push(`/editor/${item.id}`);
                            }} key={item.id} className="">
                                <div className="flex-1">
                                    <div className='aspect-[1376/768]'>
                                        <img className="w-full" src={item.imageUrl} alt={item.title} />
                                    </div>
                                    <h3 className="mt-4 text-sm text-gray-700">{item.title}</h3>
                                    <p className="mt-1 text-lg font-medium text-gray-900">{item.description}</p>
                                </div>
                                <div className="absolute right-2 flex gap-3 top-2">
                                    <span 
                                        className="cursor-pointer border-2 border-black p-[2px] text-xs	rounded-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDialog(true);
                                            setMode('debug')
                                            setTemplate(item);
                                        }}
                                    >
                                        <VscDebugAll />
                                    </span>
                                    <span 
                                        className="cursor-pointer border-2 border-black p-[2px] text-xs rounded-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowDialog(true);
                                            setMode('add');
                                            setTemplate(item);
                                        }}
                                    >
                                        <FaRegEdit />
                                    </span>
                                </div>
                            </div> 
                        );
                    })
                }  
            </div>

        </>
    )
}

export default TemplatePanel;