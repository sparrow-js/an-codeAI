import { useEffect, useState, useContext } from 'react';
import { DesignerView, Designer, AutoCodePluginManager, ILowCodePluginContext } from './designer';
import { Editor, globalContext } from './editor-core';
import { AppState, GeneratedCodeConfig } from "../components/types";
import useThrottle from "../components/hooks/useThrottle";
import {setHtmlCodeUid} from '../components/compiler';
import html2canvas from "html2canvas";
import {HistoryContext} from '../components/contexts/HistoryContext';

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
    history: any;
    generatedCodeConfig: GeneratedCodeConfig
}

export default function PreviewBox({ code, appState, sendMessageChange, history, generatedCodeConfig }: Props) {
    const throttledCode = useThrottle(code, 500);
    const {updateHistoryScreenshot} = useContext(HistoryContext);

    const onIframeLoad = async () => {
        const img = await takeScreenshot();
        updateHistoryScreenshot(img);
    }

    useEffect(() => {
        editor.on('editor.sendMessageChange', sendMessageChange);
        document.querySelector('.lc-simulator-content-frame')?.addEventListener('load', onIframeLoad);
        return () => {
            editor.removeListener('editor.sendMessageChange', sendMessageChange);
            document.querySelector('.lc-simulator-content-frame')?.removeEventListener('load', onIframeLoad);

        }
    }, [history]);

    useEffect(() => {
        if (appState === AppState.CODE_READY) {
            const codeUid = setHtmlCodeUid(generatedCodeConfig, code);
            designer.project.simulator?.writeIframeDocument(codeUid);
        } else {
            // designer.project.simulator?.writeIframeDocument(throttledCode);
        }
    }, [code, appState]);

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