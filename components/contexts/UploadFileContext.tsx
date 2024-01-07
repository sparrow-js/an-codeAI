import { createContext, ReactNode, useState, useEffect, useRef } from 'react';
import {GeneratedCodeConfig, EditorTheme, Settings} from '../types'
import { useDropzone, DropzoneRootProps, DropzoneInputProps } from "react-dropzone";
import { toast } from "react-hot-toast";

interface UploadFileContextType {
    dataUrls: string[];
    getRootProps: <T extends DropzoneRootProps>(props?: T | undefined) => T;
    getInputProps: <T extends DropzoneInputProps>(props?: T | undefined) => T;
    open: () => void;
    isFocused: boolean;
    isDragAccept: boolean;
    isDragReject: boolean;
    setUploadComplete: (callback: () => void) => void;
    setDataUrls: (newSate: string[]) => void;
}

const initialValue = {
    dataUrls: [],
    getRootProps: (props: any) => props,
    getInputProps: (props: any) => props,
    open: () => {},
    isFocused: false,
    isDragAccept: false,
    isDragReject: false,
    setUploadComplete: (callback: () => void) => {},
    setDataUrls: (newSate: string[]) => {},
}

type FileWithPreview = {
  preview: string;
} & File;

interface Props {
  setReferenceImages: (referenceImages: string[]) => void;
}


export const UploadFileContext = createContext<UploadFileContextType>(initialValue);

export default function UploadFileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [dataUrls, setDataUrlsStatus] = useState<string[]>([]);
  const [uploadComplete, setUploadCompleteStatus] = useState(() => {
    return () => {}
  });
  const [first, setFirst] = useState<boolean>(true);


  useEffect(() => {
    if (first) {
        const value = window.localStorage.getItem('dataUrls');
        if (value) {
            const valueObj = JSON.parse(value)
            setDataUrlsStatus(valueObj);
        }
        setFirst(false);
    } else {
        window.localStorage.setItem('dataUrls', JSON.stringify(dataUrls));

    }
}, [
  dataUrls
]);

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject, open } =
    useDropzone({
      maxFiles: 1,
      maxSize: 1024 * 1024 * 3, // 1 MB
      noClick: true,
      accept: {
        "image/png": [".png"],
        "image/jpeg": [".jpeg"],
        "image/jpg": [".jpg"],
      },
      onDrop: (acceptedFiles) => {
        // Set up the preview thumbnail images
        setFiles(
          acceptedFiles.map((file: File) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          ) as FileWithPreview[]
        );

        // Convert images to data URLs and set the prompt images state
        Promise.all(acceptedFiles.map((file) => fileToDataURL(file)))
          .then((dataUrls: any) => {
            setDataUrlsStatus(dataUrls)
            uploadComplete();
            // setReferenceImages(dataUrls.map((dataUrl) => dataUrl as string));
          })
          .catch((error) => {
            toast.error("Error reading files" + error);
            console.error("Error reading files:", error);
          });
      },
      onDropRejected: (rejectedFiles) => {
        toast.error(rejectedFiles[0].errors[0].message);
      },
    });

    function fileToDataURL(file: File) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    }

    function setUploadComplete(callback: () => void) {
      setUploadCompleteStatus(() => {
        return callback
      });
    }

    function setDataUrls(newState: string[]) {
      setDataUrlsStatus(newState)
    }

    return (
        <UploadFileContext.Provider
          value={{
            getRootProps,
            getInputProps,
            open,
            isDragAccept,
            isFocused,
            isDragReject,
            setUploadComplete,
            dataUrls,
            setDataUrls
          }}
        >
          {children}
        </UploadFileContext.Provider>
    );
}