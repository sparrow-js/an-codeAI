
'use client';
import React, {useState, useEffect, ReactElement} from "react";
import { FaHourglass } from "react-icons/fa";
import {Excalidraw, useHandleLibrary, exportToCanvas} from "@excalidraw/excalidraw";
import { Cross2Icon } from "@radix-ui/react-icons";

interface Props {
    doCreate: (urls: string[]) => void;
    closeWhiteboard: () => void;
}

const initialData = {
    appState: {}
};


function Whiteboard({doCreate, closeWhiteboard}: Props) {
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
                  <span
                     className="hover:bg-slate-200 p-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground mt-[2px]"
                     onClick={exportImg}
                  >
                    <FaHourglass className="text-fuchsia-800"/>
                  </span>

                  <span 
                      onClick={() => {
                        closeWhiteboard();
                      }}
                      className="hover:bg-slate-200 p-2 absolute right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <Cross2Icon />
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