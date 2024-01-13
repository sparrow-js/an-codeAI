import { useEffect, useState, useContext } from 'react';
import { DesignerView, Designer, AutoCodePluginManager, ILowCodePluginContext } from './designer';
import { Editor, globalContext } from './editor-core';
import { AppState, GeneratedCodeConfig } from "../components/types";
import useThrottle from "../components/hooks/useThrottle";
import {setHtmlCodeUid} from '../components/compiler';
import html2canvas from "html2canvas";
import {HistoryContext} from '../components/contexts/HistoryContext';
import {EditorContext} from '../components/contexts/EditorContext';
import {
    FaBug
} from "react-icons/fa";
import filesTemplate from './apps/react-shadcnui/files-template';


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
    generatedCodeConfig: GeneratedCodeConfig,
    fixBug: (error: {
        message: string;
        stack: string;
    }) => void;
}

export default function PreviewBox({ code, appState, sendMessageChange, history, generatedCodeConfig, fixBug }: Props) {
    const throttledCode = useThrottle(code, 500);
    const {updateHistoryScreenshot} = useContext(HistoryContext);
    const [showDebug, setShowDebug] = useState<boolean>(false);
    const [errorObj, setErrorObj] = useState({
      message: '',
      stack: ''
    });

    const { enableEdit, setEnableEdit } = useContext(EditorContext);
    const [filesObj, setFilesObj]= useState<any>(filesTemplate);


    useEffect(() => {
      if (enableEdit) {
        designer.project.simulator?.set('designMode', 'design')
      } else {
        designer.project.simulator?.set('designMode', 'live')
      }
    }, [enableEdit])

    const onIframeLoad = async () => {
        const img = await takeScreenshot();
        setTimeout(() => {
            updateHistoryScreenshot(img);
        }, 1000)
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
            if (
              generatedCodeConfig === GeneratedCodeConfig.HTML_TAILWIND ||
              generatedCodeConfig === GeneratedCodeConfig.REACT_TAILWIND
            ) {
              const codeUid = setHtmlCodeUid(generatedCodeConfig, code);
              if (codeUid) {
                const errorIframe = `
                <script>
                  window.addEventListener('error', (event) => {
                      window.parent.postMessage({
                        message: event.message,
                        error: event.error
                      }, '*')
                  })
                </script>  
                          `;
                let content = '';
                var patternHead = /<title[^>]*>((.|[\n\r])*)<\/title>/im; //匹配header
                const headMatch = codeUid.match(patternHead);
                if (headMatch) {
                  const headContent = headMatch[0] + errorIframe;
                  content = codeUid.replace(patternHead, headContent);
                }
                designer.project.simulator?.writeIframeDocument(content || codeUid);
              }
            } else if (generatedCodeConfig === GeneratedCodeConfig.REACT_SHADCN_UI) {
              setFilesObj((prev: any) => {
                const newFiles = {...prev};
                newFiles['/src/Preview.jsx'] = code;
                return newFiles;
              });
              filesTemplate['/src/Preview.jsx'] = code;
            } else {
              designer.project.simulator?.writeIframeDocument(code);
            }
            

        } else {
            // designer.project.simulator?.writeIframeDocument(throttledCode);
        }
    }, [code, appState]);

    useEffect(() => {
        const messageHandler = (e: any) => {
          if (e.data && e.data.error) {
            setErrorObj({
              message: e.data.error.message,
              stack: e.data.error.stack
            });
            setShowDebug(true);
          }
        }
        window.addEventListener('message', messageHandler);
        return () => {
          window.removeEventListener('message', messageHandler);
        }
      }, [])

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
            {
                showDebug && (
                <span
                    onClick={() => {
                        fixBug(errorObj);
                    }}
                    className='text-red-600 absolute right-14 top-16 z-[50] hover:bg-slate-200 rounded-sm p-2'>
                    <FaBug />
                </span>
                )
            }
            <DesignerView 
                editor={editor}
                designer={editor.get('designer')}
                simulatorProps={{
                    simulatorUrl: '',
                    isSandpack: true,
                    files: filesObj,
                }}
            />
        </div>
    )
}