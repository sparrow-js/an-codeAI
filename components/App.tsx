"use client";
import { useEffect, useRef, useState, useContext, useCallback } from "react";
import { CodeGenerationParams, generateCode } from "./generateCode";
import Spinner from "./components/Spinner";
import {
  FaCode,
  FaDesktop,
  FaDownload,
  FaMobile,
  FaUndo,
  FaCopy,
  FaChevronLeft,
  FaLaptopCode,
  FaMobileAlt,
} from "react-icons/fa";

import { AiFillCodepenCircle } from "react-icons/ai";

import { Switch } from "./components/ui/switch";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Settings, EditorTheme, AppState, GeneratedCodeConfig } from "./types";
import html2canvas from "html2canvas";
import HistoryDisplay from "./components/history/HistoryDisplay";
import { extractHistoryTree } from "./components/history/utils";
import toast from "react-hot-toast";
import {UploadFileContext} from './contexts/UploadFileContext';
import {SettingContext} from './contexts/SettingContext';
import {HistoryContext} from './contexts/HistoryContext';
import {EditorContext, deviceType} from './contexts/EditorContext';
import NativePreview from './components/NativeMobile';
import { TemplateContext } from './contexts/TemplateContext';
import UpdateChatInput from './components/chatInput/Update';
import dynamic from "next/dynamic";
import {getPartCodeUid, setUidAnchorPoint} from './compiler';
import { useDebounceFn } from 'ahooks';
import { useRouter } from 'next/navigation';
import copy from "copy-to-clipboard";
import CodePreview from './components/CodePreview';
import { PiCursorClickFill } from "react-icons/pi";
import classNames from "classnames";
import { useRouter as useNextRouter } from 'next/router';
import templates from "@/templates/templates";
import SettingsDialog from '@/components/components/SettingsDialog';


const CodeTab = dynamic(
  async () => (await import("./components/CodeTab")),
  {
    ssr: false,
  },
)

const PreviewBox = dynamic(
  async () => (await import("../engine")),
  {
    ssr: false,
  },
)

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.INITIAL);
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [referenceText, setReferenceText] = useState<string>('');
  const [executionConsole, setExecutionConsole] = useState<string[]>([]);
  const [updateInstruction, setUpdateInstruction] = useState("");
  const [partValue, setPartValue] = useState<{
    uid: string;
    message: string
  }>({uid: '', message: ''});
  
  const {
    dataUrls,
    setDataUrls,
  } = useContext(UploadFileContext)
  
  // Settings
  const {settings, setSettings, initCreate, setInitCreate, initCreateText, setInitCreateText} = useContext(SettingContext);

  const {history, addHistory,  currentVersion, setCurrentVersion, resetHistory, updateHistoryCode} = useContext(HistoryContext);
  const { enableEdit, setEnableEdit, device, setDevice } = useContext(EditorContext)
  const [tabValue, setTabValue] = useState<string>(settings.generatedCodeConfig == GeneratedCodeConfig.REACT_NATIVE ? 'native' : 'desktop')
  const [ template, setTemplate ] = useState<any>({});
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { debugTemplate, templateList } = useContext(TemplateContext);

  // Tracks the currently shown version from app history

  const [shouldIncludeResultImage, setShouldIncludeResultImage] =
    useState<boolean>(false);

  const router = useRouter();
  const nextRouter = useNextRouter();

  const wsRef = useRef<AbortController>(null);
  const initFn = useDebounceFn(() => {
    if (dataUrls.length) {
      doCreate(dataUrls, '');
      setDataUrls([]);
    }
  }, {
    wait: 300
  });
  const initTextFn = useDebounceFn(() => {
    if (initCreateText) {
      doCreate([], initCreateText);
      setInitCreateText('');
    }
  }, {
    wait: 300
  });

  const templateFn = useDebounceFn(() => {
    const slug = nextRouter.query.slug;
    let template = templates.list.find(item => item.id === slug);
    let customTemplate = templateList.find(item => item.id === slug);
    if (slug?.includes('debug') || customTemplate) {
      const template = slug?.includes('debug') ? debugTemplate : customTemplate as any;
      setGeneratedCode(template.code);
      addHistory("create", updateInstruction, referenceImages, referenceText, template.code, partValue.message);
      setAppState(AppState.CODE_READY);
      if (template) {
        setTemplate(template)
      }
      return;
    }

    // templateList

    if (template) {
      setTemplate(template)
    }
    doCreate([], '', slug as string);
  }, {
    wait: 300
  });


  // When the user already has the settings in local storage, newly added keys
  // do not get added to the settings so if it's falsy, we populate it with the default
  // value
  useEffect(() => {
    if (!settings.generatedCodeConfig) {
      setSettings({
        ...settings,
        generatedCodeConfig: GeneratedCodeConfig.HTML_TAILWIND,
      });
    }
    
  }, [settings.generatedCodeConfig, setSettings]);

  useEffect(() => {
    const slug = nextRouter.query.slug;
    if (slug === 'create') {
      if (dataUrls.length) {
        initFn.run();
      }
      if (initCreateText) {
        initTextFn.run();
      }
    } else {
      templateFn.run();
    }
  }, [initCreate, dataUrls, initCreateText, template]);

  const takeScreenshot = async (): Promise<string> => {
    const iframeElement = document.querySelector(
      ".lc-simulator-content-frame"
    ) as HTMLIFrameElement;
    if (!iframeElement?.contentWindow?.document.body) {
      return "";
    }

    const canvas = await html2canvas(iframeElement.contentWindow.document.body);
    const png = canvas.toDataURL("image/png");
    return png;
  };

  const downloadCode = () => {
    // Create a blob from the generated code
    const blob = new Blob([generatedCode], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    // Create an anchor element and set properties for download
    const a = document.createElement("a");
    a.href = url;
    a.download = settings.generatedCodeConfig === GeneratedCodeConfig.REACT_SHADCN_UI ? "index.jsx" : "index.html"; // Set the file name for download
    document.body.appendChild(a); // Append to the document
    a.click(); // Programmatically click the anchor to trigger download

    // Clean up by removing the anchor and revoking the Blob URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setAppState(AppState.INITIAL);
    setGeneratedCode("");
    setReferenceImages([]);
    setExecutionConsole([]);
    resetHistory();
  };

  const stop = () => {
    if (wsRef.current && !wsRef.current.signal.aborted) {
      wsRef.current.abort();
  }    // make sure stop can correct the state even if the websocket is already closed
    setAppState(AppState.CODE_READY);
  };

  function doGenerateCode(
    params: CodeGenerationParams,
    parentVersion: number | null
  ) {
    setExecutionConsole([]);
    setAppState(AppState.CODING);

    // Merge settings with params
    const updatedParams = { ...params, ...settings, slug: nextRouter.query.slug, template };
    generateCode(
      wsRef,
      updatedParams,
      (token) => setGeneratedCode((prev) => prev + token),
      (code) => {
        setGeneratedCode(code);
        addHistory(params.generationType, updateInstruction, referenceImages, referenceText, code, partValue.message);
      },
      (line) => setExecutionConsole((prev) => [...prev, line]),
      () => {
        setAppState(AppState.CODE_READY);
      },
      (error)=> {
        if (error === 'No openai key, set it') {
          setOpenDialog(true);
        }
      },
    );
  }

  // Initial version creation
  function doCreate(referenceImages: string[], text: string, slug?: string) {
    // Reset any existing state
    reset();

    setReferenceImages(referenceImages);
    setReferenceText(text);

    if (referenceImages.length > 0 || text || slug) {
      doGenerateCode(
        {
          generationType: "create",
          image: referenceImages[0],
          text,
        },
        currentVersion
      );
    }
  }

  // Subsequent updates
  async function doUpdate(partData?: any) {
    if (currentVersion === null) {
      toast.error(
        "No current version set. Contact support or open a Github issue."
      );
      return;
    }

    const updatedHistory = [
      ...extractHistoryTree(history, currentVersion),
      updateInstruction,
    ];

    if (shouldIncludeResultImage) {
      const resultImage = await takeScreenshot();
      doGenerateCode(
        {
          generationType: "update",
          image: referenceImages[0],
          text: referenceText,
          resultImage: resultImage,
          history: updatedHistory,
        },
        currentVersion
      );
    } else {
      doGenerateCode(
        {
          generationType: "update",
          image: referenceImages[0],
          text: referenceText,
          history: updatedHistory,
        },
        currentVersion
      );
    }

    setGeneratedCode("");
    setUpdateInstruction("");
  }

  async function doPartUpdate(partData?: any) {
    const {uid, message} = partData;
    // const code = getPartCodeUid(uid);
    const codeHtml = setUidAnchorPoint(uid, generatedCode, settings.generatedCodeConfig);
    updateHistoryCode(codeHtml)
//     const updatePrompt = `
// Change ${code} as follows:
// ${message}
// Re-enter the code.
//     `;
    const updatePrompt = `
Find the element with attribute data-uid="${uid}" and change it as described below:
${message}
Re-output the code and do not need to output the data-uid attribute.
    `;
    setPartValue(partData);
    setUpdateInstruction(updatePrompt);
  }

  
  useEffect(() => {
    const errorUpdate = updateInstruction.includes('Fix the code error and re-output the code');
    const partUpdate = updateInstruction.includes('Re-enter the code.');
    if (errorUpdate || partUpdate || updateInstruction) {
      doUpdate();
    }
  }, [
    updateInstruction
  ])

  async function fixBug(error: {
    message: string;
    stack: string;
  }) {
    const errorPrompt = `
Fix the code error and re-output the code.
error message:
${error.message}
${error.stack}
    `;
    setUpdateInstruction(errorPrompt);
  }

  const copyCode = useCallback(() => {
    copy(generatedCode);
    toast.success("Copied to clipboard");
  }, [generatedCode]);


  
  const doOpenInCodepenio = useCallback(async () => {
    // TODO: Update CSS and JS external links depending on the framework being used
    const data = {
      html: generatedCode,
      editors: "100", // 1: Open HTML, 0: Close CSS, 0: Close JS
      layout: "left",
      css_external:
        "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" +
        (generatedCode.includes("<ion-")
          ? ",https://cdn.jsdelivr.net/npm/@ionic/core/css/ionic.bundle.css"
          : ""),
      js_external:
        "https://cdn.tailwindcss.com " +
        (generatedCode.includes("<ion-")
          ? ",https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.esm.js,https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.js"
          : ""),
    };

    // Create a hidden form and submit it to open the code in CodePen
    // Can't use fetch API directly because we want to open the URL in a new tab
    const input = document.createElement("input");
    input.setAttribute("type", "hidden");
    input.setAttribute("name", "data");
    input.setAttribute("value", JSON.stringify(data));

    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", "https://codepen.io/pen/define");
    form.setAttribute("target", "_blank");
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
  }, [generatedCode]);


  return (
    <div className="dark:bg-black dark:text-white h-full">
      <div className="fixed inset-y-0 z-40 flex w-[200px] flex-col">
        <div className="flex grow flex-col gap-y-2 overflow-y-auto border-r border-gray-200 bg-white px-4 py-4 dark:bg-zinc-950 dark:text-white">
          {(appState === AppState.CODING ||
            appState === AppState.CODE_READY) && (
            <>
              {appState === AppState.CODING && (
                <div>
                   <CodePreview code={generatedCode}/>
                 </div>
              )}
              {/* Show code preview only when coding */}
              {appState === AppState.CODING && (
                <div className="flex flex-col">
                  <div className="flex w-full">
                    <Button
                      onClick={stop}
                      className="w-full dark:text-white dark:bg-gray-700"
                    >
                      Stop
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <div className="grid w-full gap-2">
                  <div className="flex justify-between items-center gap-x-2">
                    <div className="font-500 text-xs text-slate-700 dark:text-white">
                      Include screenshot of current version?
                    </div>
                    <Switch
                      checked={shouldIncludeResultImage}
                      onCheckedChange={setShouldIncludeResultImage}
                      className="dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Reference image display */}
              <div className="flex flex-col mt-2">
                <div className="flex flex-col">
                  <div>
                    {referenceText ? (
                      <div className="border p-1 border-slate-200 w-full rounded bg-[#ebebeb]">
                        <p className="text-sm">
                          {referenceText}
                        </p>
                      </div>
                    ) : (
                      (referenceImages[0] || template.imageUrl) ? (
                        <img
                          className="w-[340px] border border-gray-200 rounded-md"
                          src={referenceImages[0] || template.imageUrl}
                          alt="Reference"
                        />
                      ) : <></> 
                    )}
                  </div>
                  <div className="text-gray-400 uppercase text-sm text-center mt-1">
                    Original Info
                  </div>
                </div>
                <div className="bg-gray-400 px-4 py-2 rounded text-sm hidden">
                  <h2 className="text-lg mb-4 border-b border-gray-800">
                    Console
                  </h2>
                  {executionConsole.map((line, index) => (
                    <div
                      key={index}
                      className="border-b border-gray-400 mb-2 text-gray-600 font-mono"
                    >
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {
            <HistoryDisplay
              history={history}
              currentVersion={currentVersion}
              revertToVersion={(index) => {
                if (
                  index < 0 ||
                  index >= history.length ||
                  !history[index]
                )
                  return;
                setCurrentVersion(index);
                setGeneratedCode(history[index].code);
              }}
              shouldDisableReverts={appState === AppState.CODING}
            />
          }
        </div>
      </div>
      <main className="pl-[200px] relative h-full flex flex-col pb-10">
          <div className="w-[90%] ml-[5%] flex-1 mt-4">
            <div className="flex absolute gap-2">
              <Button 
                onClick={() => {
                  reset();
                  router.push('/', { scroll: false })
                }}
              >
                <FaChevronLeft />
                New</Button>
              {appState === AppState.CODE_READY && (
                <>
                  {
                    GeneratedCodeConfig.REACT_SHADCN_UI !== settings.generatedCodeConfig && (
                      <span
                        onClick={doOpenInCodepenio}
                        className="hover:bg-slate-200 rounded-sm w-[36px] h-[36px] flex items-center justify-center border-black border-2"
                      >
                        <AiFillCodepenCircle className="w-[18px] h-[18px]"/>
                      </span>
                    )
                  }
                  <span
                    onClick={copyCode}
                    className="hover:bg-slate-200 rounded-sm w-[36px] h-[36px] flex items-center justify-center border-black border-2"
                  > 
                    <FaCopy />
                  </span> 
                  <span
                    onClick={downloadCode}
                    className="hover:bg-slate-200 rounded-sm w-[36px] h-[36px] flex items-center justify-center border-black border-2"
                  >
                    <FaDownload />
                  </span>
                  <span
                    className="hover:bg-slate-200 rounded-sm w-[36px] h-[36px] flex items-center justify-center border-black border-2"
                    onClick={() => {
                      if (device === deviceType.PC) {
                        setDevice(deviceType.MOBILE)
                      } else {
                        setDevice(deviceType.PC)
                      }
                    }}
                  >
                    {
                      device === deviceType.PC ? (
                        <FaLaptopCode className="w-[20px]"/>
                      ) : (
                        <FaMobileAlt className="h-[20px]"/>
                      )
                    }
                    
                  </span>
                  <span
                    className={classNames(
                      "hover:bg-slate-200 rounded-full border-black border-2 w-[36px] h-[36px] flex items-center justify-center",
                      {
                        "border-blue-500 text-blue-500": enableEdit,
                      }
                    )}
                    onClick={() => {
                      setEnableEdit(!enableEdit);
                    }}
                  >
                    <PiCursorClickFill className="w-[18px] h-[18px]"/>
                  </span>
                </>
              )}

              {appState === AppState.CODING && (
                <>
                  <span className="flex items-center gap-x-1">
                    <Spinner />
                    {executionConsole.slice(-1)[0]}
                  </span>
                </>
              )}
            </div>
            <Tabs onValueChange={(e: any) => {
              setTabValue(e)
            }} className="h-full flex flex-col" defaultValue={settings.generatedCodeConfig == GeneratedCodeConfig.REACT_NATIVE ? 'native' : 'desktop'}>
              <div className="flex justify-end mr-8 mb-4">
                <TabsList>
                  {
                    settings.generatedCodeConfig === GeneratedCodeConfig.REACT_NATIVE ? (
                      <TabsTrigger value="native" className="flex gap-x-2">
                      <FaDesktop /> native Mobile
                    </TabsTrigger>
                    ) : (
                      <>
                        <TabsTrigger value="desktop" className="flex gap-x-2">
                          <FaDesktop /> Desktop
                        </TabsTrigger>
                      </>
                    )
                  }
                  <TabsTrigger value="code" className="flex gap-x-2">
                    <FaCode />
                    Code
                  </TabsTrigger>
                </TabsList>
              </div>
              {
                tabValue === 'native' && (
                <div
                  className={
                    classNames('h-full')
                  }
                 >
                    <NativePreview code={generatedCode} appState={appState}/>
                 </div>
                )
              }
             
               <div
                className={
                  classNames('h-full flex justify-center', {
                    'hidden': tabValue !== 'desktop'
                  })
                }
               >      
                  <div
                      className={
                        classNames("h-full", {
                          "w-full": device === deviceType.PC,
                          "w-[375px]": device === deviceType.MOBILE
                        }
                      )}
                  >
                      <PreviewBox  
                        code={generatedCode}
                        appState={appState}
                        sendMessageChange={(data) => {
                          doPartUpdate(data);
                        }}
                        generatedCodeConfig={settings.generatedCodeConfig}
                        history={history}
                        fixBug={fixBug}
                      />
                  </div>
                   
                      {/* <Preview code={generatedCode} device="desktop" appState={appState} fixBug={fixBug}/> */}
                </div>
              <div 
                className={
                  classNames('h-full', {
                    'hidden': tabValue !== 'code'
                  })
                }
              >
                <CodeTab
                  code={generatedCode}
                  setCode={setGeneratedCode}
                  settings={settings}
                />
              </div>
            </Tabs>
          </div>
          <div className="flex justify-center mt-10">
            <div className="w-[520px] rounded-md shadow-sm ">
              <UpdateChatInput updateSendMessage={(message: string) => {
                setUpdateInstruction(message);
                setPartValue({
                  uid: '',
                  message: ''
                });
              }}/>
            </div>
          </div>
      </main>
      <span className="hidden">
        <SettingsDialog 
            settings={settings} 
            setSettings={setSettings}
            openDialog={openDialog}
            setOpenDialog={setOpenDialog}
        />
      </span>
    </div>
  );
}

export default App;