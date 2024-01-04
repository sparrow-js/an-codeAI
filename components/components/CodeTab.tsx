import { FaCopy } from "react-icons/fa";
import { Button } from "./ui/button";
import { Settings } from "../types";
import copy from "copy-to-clipboard";
import { useCallback } from "react";
import toast from "react-hot-toast";
import * as monaco from 'monaco-editor';
import Editor, { loader } from '@monaco-editor/react';

loader.config({ monaco });

interface Props {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  settings: Settings;
}

function CodeTab({ code, setCode, settings }: Props) {
  
  return (
    <div className="relative h-full flex flex-col">
      <Editor
        defaultLanguage="html" 
        defaultValue="" 
        value={code}
        onChange={(value) => {
          setCode(value as string)
        }}
      />
    </div>
  );
}

export default CodeTab;
