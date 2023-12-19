
import React, {useState, useRef} from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FaPencilRuler, FaHourglass } from "react-icons/fa";
import { Excalidraw, exportToCanvas } from "@excalidraw/excalidraw";


interface Props {
    doCreate: (urls: string[]) => void;
}

const initialData = {
    appState: {}
};

function Whiteboard({doCreate}: Props) {

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [excalidrawAPI, setExcalidrawAPI] = useState(null);
  
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
        getDimensions: () => { return {width: 350, height: 350}}
      });
      doCreate([canvas.toDataURL()])
      setShowDialog(false);
    }

  return (
    <div className="relative">
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger>
               <FaPencilRuler className="mr-3"/>
            </DialogTrigger>
            <DialogContent className="w-full h-full max-w-[100%] p-[0px]">
                <Excalidraw   
                    renderTopRightUI={() => (
                        <FaHourglass  
                            className="mt-[10px]"
                            onClick={exportImg}
                        />
                    )}
                    // @ts-ignore
                    excalidrawAPI={(api) => setExcalidrawAPI(api)}/>
            </DialogContent>
        </Dialog>
    </div>
  );
}

export default Whiteboard;