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
import {promptContext, PromptType} from '../contexts/PromptContext'
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

interface Props {
    settings: Settings;
    setSettings: (newState: Settings) => void;}

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
        prompt.type = settings && settings.generatedCodeConfig;
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
            setSettings({
                ...settings,
                promptCode: prompt ? prompt.prompt : '',
            });
        } else  {
            setSettings({
                ...settings,
                promptCode: '',
            });
        }
    }, [selectedId]);

    useEffect(() => {
        setSettings({
            ...settings,
            promptCode: '',
        });

        setSelectedId('');
        
    }, [settings?.generatedCodeConfig]);

    const updatePromptHandler = (e: any, id: string) => {
        e.stopPropagation();
        setShowDialog(true);
        const prompt = getPromptById(id);
        prompt && setPrompt(prompt);
    }
    
    return (
        <div className="bg-white shadow-lg rounded-lg p-4 flex flex-col hover:ring ring-black relative border-dashed border-2 border-gray-300">
            <div className="rounded-lg flex justify-center items-center w-full h-full">
                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                    <DialogTrigger
                        className="w-full h-full"
                        onClick={() => {
                            setPrompt(cloneDeep(initPrompt));
                        }}
                    >
                        <div>
                            + Add own template
                        </div>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="mb-4">template</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col space-y-4">
                            <Label htmlFor="">
                                <div>stack</div>
                            </Label>
                            <Select defaultValue={GeneratedCodeConfig.HTML_TAILWIND}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a stack" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                    <SelectLabel>stack</SelectLabel>
                                        {TechnologyStackList.map((stack) => {
                                            return (
                                                <SelectItem value={stack.label}>{stack.value}</SelectItem>
                                            )
                                        })}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-4">
                            <Label htmlFor="inputcode">
                                <div>input code</div>
                            </Label>
                            <Textarea
                                id="inputcode"
                                placeholder="inputcode"
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
                            <Label htmlFor="name">
                                <div>name</div>
                            </Label>
                            <Input
                                id="name"
                                placeholder="name"
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
                            <Label htmlFor="des">
                                <div>des</div>
                            </Label>
                            <Input
                                id="des"
                                placeholder="des"
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
                            <Label htmlFor="img-url">
                                <div>image url</div>
                            </Label>
                            <Input
                                id="img-url"
                                placeholder="img url"
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
        </div>
    )
}

export default PromptPanel;