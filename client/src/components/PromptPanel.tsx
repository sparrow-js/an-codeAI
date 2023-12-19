import { Settings } from "../types";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import {useContext, useState} from 'react';
import {promptContext, PromptType} from '../contexts/PromptContext'
import {GeneratedCodeConfig} from '../types'
import { cloneDeep } from "lodash";
import { FaTrashAlt, FaHammer } from "react-icons/fa";
import classNames from "classnames";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

interface Props {
    settings: Settings;
    setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

function PromptPanel({settings, setSettings}: Props) {
    const [selectedId, setSelectedId] = useState<string>('');
    const { promptList, addPrompt, getPromptById, removePrompt } = useContext(promptContext);
    const initPrompt = {
        id: '',
        name: '',
        des: '',
        imgUrl: '',
        prompt: '',
        type: GeneratedCodeConfig.REACT_ANTD
    }
    const [prompt, setPrompt] = useState<PromptType>(cloneDeep(initPrompt));
    const [showDialog, setShowDialog] = useState<boolean>(false);

    async function addPromptHanler() {
        // generatedCodeConfig: "react_tailwind"
        prompt.type = settings.generatedCodeConfig;
        if (!prompt.prompt) {
            toast.error('enter prompt')
            return;
        }
        addPrompt(prompt);
        setPrompt(cloneDeep(initPrompt));
    }

    useEffect(() => {
        if (selectedId) {
            const prompt = getPromptById(selectedId);
            setSettings((prev) => ({
                ...prev,
                promptCode: prompt ? prompt.prompt : '',
            }));
        } else  {
            setSettings((prev) => ({
                ...prev,
                promptCode: '',
            }));
        }
    }, [selectedId]);

    useEffect(() => {
        setSettings((prev) => ({
            ...prev,
            promptCode: '',
        }));

        setSelectedId('');
        
    }, [settings.generatedCodeConfig, setSettings]);

    const updatePromptHandler = (e: any, id: string) => {
        e.stopPropagation();
        setShowDialog(true);
        const prompt = getPromptById(id);
        prompt && setPrompt(prompt);
    }
    
    return (
        <div className="relative">
            <div className="grid grid-cols-2 gap-4">
                <div className="border-dashed border-2 border-gray-300 p-6 rounded-lg flex justify-center items-center hover:shadow-lg">
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogTrigger
                        className="w-full h-full"
                        onClick={() => {
                            setPrompt(cloneDeep(initPrompt));
                        }}
                    >
                        <div>
                            + Add Prompt
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="mb-4">Prompt</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col space-y-4">
                            <Label htmlFor="prompt">
                                <div>prompt example</div>
                            </Label>
                            <Textarea
                                id="prompt"
                                placeholder="prompt"
                                value={prompt.prompt}
                                onChange={(e) => {
                                    setPrompt((s) => ({
                                        ...s,
                                        prompt: e.target.value,
                                    }));
                                }}
                            ></Textarea>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <Label htmlFor="prompt-name">
                                <div>prompt name</div>
                            </Label>
                            <Input
                                id="prompt-name"
                                placeholder="prompt name"
                                value={prompt.name}
                                onChange={(e) => {
                                    setPrompt((s) => ({
                                        ...s,
                                        name: e.target.value,
                                    }));
                                }}
                            />
                        </div>
                        <div className="flex flex-col space-y-4">
                            <Label htmlFor="prompt-des">
                                <div>prompt des</div>
                            </Label>
                            <Input
                                id="prompt-des"
                                placeholder="prompt des"
                                value={prompt.des}
                                onChange={(e) => {
                                    setPrompt((s) => ({
                                        ...s,
                                        des: e.target.value,
                                    }));
                                }}
                            />
                        </div>
                        <div className="flex flex-col space-y-4">
                            <Label htmlFor="prompt-url">
                                <div>prompt url</div>
                            </Label>
                            <Input
                                id="prompt-url"
                                placeholder="prompt url"
                                value={prompt.imgUrl}
                                onChange={(e) => {
                                    setPrompt((s) => ({
                                        ...s,
                                        imgUrl: e.target.value,
                                    }));
                                }}
                            />
                        </div>
                        <DialogFooter>
                            <DialogClose onClick={addPromptHanler}>Save</DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>          
                </div>
                {
                    promptList.map((prompt) => {
                        if (prompt.type === settings.generatedCodeConfig) {
                            return (
                                <div 
                                    key={prompt.id} 
                                    onClick={async () => {
                                        if (selectedId === prompt.id) {
                                            setSelectedId('');
                                        } else {
                                            setSelectedId(prompt.id)
                                        }            
                                    }}
                                    className={
                                        classNames(
                                            "bg-white rounded-lg hover:shadow-lg shadow overflow-hidden h-[230px]",
                                            selectedId === prompt.id ? 'border-2 border-solid border-emerald-500' : ''
                                        )
                                    }>
                                    <img className="w-full h-[106px]" src={prompt.imgUrl} alt="Placeholder image with various geometric shapes and ANT DESIGN logo" />
                                    <div className="p-2 border-t border-gray-200 h-[80px]">
                                        <p className="font-bold">{prompt.name}</p>
                                        <p className="text-gray-700 text-sm line-clamp-2">{prompt.des}</p>
                                    </div>
                                    <div className="flex p-3">
                                        <span className="mr-2" onClick={(e) => {
                                            updatePromptHandler(e, prompt.id)
                                        }}>
                                            <FaHammer className="hover:text-emerald-500"/>
                                        </span>
                                        <span onClick={() => {
                                            removePrompt(prompt.id);
                                        }}>
                                            <FaTrashAlt className="hover:text-red-500"/>
                                        </span>
                                    </div>
                                </div>
                            )
                        } else {
                            return null;
                        }
                    })
                }
            </div>
        </div>
    )
}

export default PromptPanel;