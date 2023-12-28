
'use client';
import React, {useState, useEffect, ReactElement} from "react";
import { FaHourglass } from "react-icons/fa";
import {Excalidraw, useHandleLibrary, exportToCanvas} from "@excalidraw/excalidraw";

interface Props {
    doCreate: (urls: string[]) => void;
}

const initialData = {
    appState: {}
};


function Whiteboard({doCreate}: Props) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  useHandleLibrary({ excalidrawAPI });


  const exportImg = async () => {
      if (!excalidrawAPI) {
        return
      }

      const elements = (excalidrawAPI as any).getSceneElements();
      if (!elements || !elements.length) {
        return
      }
      const canvas = await exportToCanvas ({
        elements,
        appState: {
          ...initialData.appState,
          exportWithDarkMode: false,
        },
        files: (excalidrawAPI as any).getFiles(),
        // getDimensions: () => { return {width: 750, height: 750}}
      });
      // setCanvasUrl(canvas.toDataURL());
      doCreate([canvas.toDataURL()])
   }



  return (
      <div className="w-full h-full">
          {Excalidraw ? (
            // @ts-ignore
            <Excalidraw   
              renderTopRightUI={() => (
                  <>

                    <span className="hover:bg-slate-200 p-2 rounded-sm top-6 flex justify-center items-center">
                      <FaHourglass  
                          onClick={exportImg}
                      />
                    </span>
                  </>
              )}
              // @ts-ignore
              excalidrawAPI={(api) => setExcalidrawAPI(api)}
            >

            {/* <MainMenu>
              <MainMenu.Item onSelect={() => {
                (excalidrawAPI as any).resetScene();
              }}>
                help
              </MainMenu.Item>
            </MainMenu> */}
            </Excalidraw>
          ) : null}
      </div>
  );
}

export default Whiteboard;