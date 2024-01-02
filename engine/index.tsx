import { useEffect, useState } from 'react';
import { DesignerView, Designer, AutoCodePluginManager, ILowCodePluginContext } from './designer';
import { Editor, globalContext } from './editor-core';
import { AppState } from "../components/types";
import useThrottle from "../components/hooks/useThrottle";
import {setHtmlCodeUid} from '../components/compiler';
import html2canvas from "html2canvas";

const editor = new Editor();
globalContext.register(editor, Editor);
globalContext.register(editor, 'editor');

const designer = new Designer({ editor });
editor.set('designer' as any, designer);
const plugins = new AutoCodePluginManager(editor).toProxy();
(async function registerPlugins() {
    const editorInit = (ctx: ILowCodePluginContext) => {
        return {
          name: 'editor-init',
          async init() {     
            // 设置物料描述
            const { project } = ctx;
    
            // 加载 schema
            project.open();
          },
        };
    };
    editorInit.pluginName = 'editorInit';
    await plugins.register(editorInit);
    // pluginPreference
    await plugins.init({} as any);

})();

interface Props {
    code: string;
    appState: AppState;
    sendMessageChange: (e: any) => void;
}

export default function PreviewBox({ code, appState, sendMessageChange }: Props) {
    const throttledCode = useThrottle(code, 500);

    const onIframeLoad = async () => {
        setTimeout(async() => {
            const img = await takeScreenshot()
            console.log(img);
        }, 2000)
    }

    useEffect(() => {
        editor.on('editor.sendMessageChange', sendMessageChange);
        designer.project.simulator?.emitter.on('onIframeLoad', onIframeLoad);

        return () => {
            editor.removeListener('editor.sendMessageChange', sendMessageChange);
            designer.project.simulator?.emitter.removeListener('onIframeLoad', onIframeLoad);
        }
    }, []);

    useEffect(() => {
        if (appState === AppState.CODE_READY) {
            const codeUid = setHtmlCodeUid(throttledCode);
            designer.project.simulator?.writeIframeDocument(codeUid);
        } else {
            // designer.project.simulator?.writeIframeDocument(throttledCode);
        }
    }, [throttledCode]);

    const takeScreenshot = async (): Promise<string> => {
        const body = designer.project.simulator?.contentWindow?.document.body;
        if (!body) {
            return "";
        } else {
            const canvas = await html2canvas(body);
            const png = canvas.toDataURL("image/png");
            return png;
        }
    };
    
    

    return (
        <div className="border-[4px] border-black rounded-[20px] shadow-lg w-full h-full">
            <DesignerView 
                editor={editor}
                designer={editor.get('designer')}
                simulatorProps={{
                    simulatorUrl: '',
                    code: code
                }}
            />
        </div>
    )
}