/*
 * @ts-nocheck
 * Preventing TS checks with files presented in the video for a better presentation.
 */
import { MODEL_REGEX, PROVIDER_REGEX } from '@/utils/constants';
import { Markdown } from './Markdown';
import type { JSONValue } from 'ai';


interface UserMessageProps {
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
  annotations?: JSONValue[];
}

export function UserMessage({ content, annotations }: UserMessageProps) {
  if (annotations?.includes('manually_edited')) {
    return (
      <div className="overflow-hidden pt-[4px]">
        <div className="grid grid-col-1 w-full">
          <div className="overflow-hidden w-full">
            <div className=" flex gap-2 items-center text-sm text-bolt-elements-textSecondary mb-2"></div>
            <div className="Markdown-module-scss-module__fFSt2W__MarkdownContent">
              <div className="artifact border border-bolt-elements-borderColor flex flex-col overflow-hidden rounded-lg w-full transition-border duration-150">
                <div className="flex">
                  <button className="flex items-stretch bg-bolt-elements-artifacts-background hover:bg-bolt-elements-artifacts-backgroundHover w-full overflow-hidden">
                    {/* <div className="p-4">
                      <div className="i-ph:files-light" style={{ fontSize: '2rem' }}></div>
                    </div> */}
                    <div className="bg-bolt-elements-artifacts-borderColor w-[1px]"></div>
                    <div className="px-5 p-3.5 w-full text-left">
                      <div className="w-full text-bolt-elements-textPrimary font-medium leading-5 text-sm">Files have been manually edited.</div>
                      <div className="w-full text-bolt-elements-textSecondary text-xs mt-0.5">Click to open Workbench</div>
                    </div>
                  </button>
                  <div className="bg-bolt-elements-artifacts-borderColor w-[1px]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (Array.isArray(content)) {
    const textItem = content.find((item) => item.type === 'text');
    const textContent = stripMetadata(textItem?.text || '');
    const images = content.filter((item) => item.type === 'image_url' && item.image_url?.url);

    return (
      <div className="overflow-hidden pt-[4px]">
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden max-h-[512px]">
            {textContent && <Markdown html>{textContent}</Markdown>}
          </div>
          <div className="overflow-scroll max-h-[212px]">
            {images.map((item, index) => (
              <img
                key={index}
                src={item.image_url?.url}
                alt={`Image ${index + 1}`}
                className="max-w-full h-auto rounded-lg"
                style={{ objectFit: 'contain' }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const textContent = stripMetadata(content);

  return (
    <div className="overflow-hidden pt-[4px]">
      <div className="overflow-hidden max-h-[512px]">
        <Markdown html>{textContent}</Markdown>
      </div>
    </div>
  );
}

function stripMetadata(content: string) {
  return content.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '');
}
