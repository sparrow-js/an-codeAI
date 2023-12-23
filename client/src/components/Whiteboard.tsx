
import React, {useState} from "react";
import { FaHourglass } from "react-icons/fa";
import { Excalidraw, exportToCanvas } from "@excalidraw/excalidraw";
import { Cross2Icon } from "@radix-ui/react-icons"


interface Props {
    doCreate: (urls: string[]) => void;
}

const initialData = {
    appState: {}
};

function Whiteboard({doCreate}: Props) {

  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  // const [canvasUrl, setCanvasUrl] = useState("");

  const exportImg = async () => {
      if (!excalidrawAPI) {
        return
      }

      const elements = (excalidrawAPI as any).getSceneElements();
      if (!elements || !elements.length) {
        return
      }
      const canvas = await exportToCanvas({
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
      <div className="absolute top-0 z-[10] w-full h-full">
          <Excalidraw   
              renderTopRightUI={() => (
                  <>

                    <span className="hover:bg-slate-200 p-2 rounded-sm">
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
      </div>
  );
}

export default Whiteboard;