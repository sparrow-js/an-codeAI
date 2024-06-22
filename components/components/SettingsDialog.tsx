import React, {useEffect, useState} from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { FaCog } from "react-icons/fa";
import { Settings } from "../types";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {RadioGroup, RadioGroupItem} from './ui/radio-group';
import classNames from 'classnames';
import { HiArrowUp } from "react-icons/hi2";
import OnboardingNote from './OnboardingNote';

interface Props {
  settings: Settings;
  setSettings: (newState: Settings) => void;
  openDialog: boolean;
  setOpenDialog: (newState: boolean) => void;
}

function SettingsDialog({ settings, setSettings, openDialog, setOpenDialog }: Props) {

  const [llm, setLlm] = useState<string>('openai');
  const [delayShowArrow, setDelayShowArrow] = useState<boolean>(false);
  useEffect(() => {
    setTimeout(() => {
      setDelayShowArrow(true);
    }, 500)
  }, []);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger 
        className={classNames(
          "hover:bg-slate-200 rounded-sm p-2 relative flex justify-center items-center",
      )}
      >
      {
        delayShowArrow && !settings?.openAiApiKey && (
        <>
            <div 
              className="absolute top-[46px] right-[-5px] animate-bounce bg-white dark:bg-slate-800 p-2 w-10 h-10 ring-1 ring-slate-900/5 dark:ring-slate-200/20 shadow-lg rounded-full flex items-center justify-center"
            >
              <HiArrowUp className="w-6 h-6 text-violet-500"/>
            </div>
            <span 
              className="text-sm font-bold mr-2"
            >Setting Key </span>
          </>
        )
      }
      <FaCog />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4">Settings</DialogTitle>
        </DialogHeader>

        {/* <div className="flex items-center space-x-2">
          <Label htmlFor="image-generation">
            <div>DALL-E Placeholder Image Generation</div>
            <div className="font-light mt-2">
              More fun with it but if you want to save money, turn it off.
            </div>
          </Label>
          <Switch
            id="image-generation"
            checked={settings.isImageGenerationEnabled}
            onCheckedChange={() =>
              setSettings((s) => ({
                ...s,
                isImageGenerationEnabled: !s.isImageGenerationEnabled,
              }))
            }
          />
        </div> */}
        <div className="flex flex-col space-y-4">
          <div className="border-b-2 border-black pb-4">
            <RadioGroup onValueChange={(data) => {
              setLlm(data);
              setSettings({
                ...settings,
                llm: data,
              })
            }} className="flex item-center" color="indigo" defaultValue={settings.llm}>
              <Label className="flex item-center" htmlFor="openai-llm">
                <span className="mr-2">OpenAI</span>
                <RadioGroupItem value="openai" id="openai-llm"/>
              </Label>
              <Label className="flex item-center" htmlFor="Anthropic-llm">
                <span className="mr-2">Anthropic</span>
                <RadioGroupItem  value="anthropic" id="Anthropic-llm"/>
              </Label>
            </RadioGroup>
          </div>
          {
            settings.llm === 'openai' ? (
              <>
              <Label htmlFor="openai-api-key">
                <div>OpenAI API key</div>
                <div className="font-light mt-2 leading-relaxed">
                  Only stored in your browser. Never stored on servers. Overrides
                  your .env config.
                  <button 
                    className="inline-flex items-center justify-center ml-2">
                     <OnboardingNote/>
                  </button>
                </div>
              </Label>

              <Input
                id="openai-api-key"
                placeholder="OpenAI API key"
                value={settings?.openAiApiKey || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    openAiApiKey: e.target.value,
                  })
                }
              />

              <Label htmlFor="openai-api-key">
                <div>OpenAI Base URL (optional)</div>
                <div className="font-light mt-2 leading-relaxed">
                  Replace with a proxy URL if you don't want to use the default.
                </div>
              </Label>

              <Input
                id="openai-base-url"
                placeholder="OpenAI Base URL"
                value={settings?.openAiBaseURL || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    openAiBaseURL: e.target.value,
                  })
                }
              />
              </>

            ) : (
              <>
              <Label htmlFor="Anthropic-api-key">
                <div>Anthropic API key</div>
                <div className="font-light mt-2 leading-relaxed">
                  Only stored in your browser. Never stored on servers. Overrides
                  your .env config.
                  <button 
                    className="inline-flex items-center justify-center ml-2">
                     <OnboardingNote/>
                  </button>
                </div>
              </Label>

              <Input
                id="anthropic-api-key"
                placeholder="Anthropic API key"
                value={settings?.anthropicApiKey || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    anthropicApiKey: e.target.value,
                  })
                }
              />

              <Label htmlFor="anthropic-api-key">
                <div>Anthropic Base URL (optional)</div>
                <div className="font-light mt-2 leading-relaxed">
                  Replace with a proxy URL if you don't want to use the default.
                </div>
              </Label>

              <Input
                id="anthropic-base-url"
                placeholder="Anthropic Base URL"
                value={settings?.anthropicBaseURL || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    anthropicBaseURL: e.target.value,
                  })
                }
              />
              </>
            )
          }
          
        </div>
        {
           process.env.NEXT_PUBLIC_SHOW_MOCK === 'true' && (
            <div className="flex items-center space-x-2">
              <Label htmlFor="image-generation">
                <div>mock AI response</div>
                <div className="font-light mt-2">
                  mock AI response
                </div>
              </Label>
              <Switch
                id="image-generation"
                checked={settings?.mockAiResponse}
                onCheckedChange={() =>
                  setSettings({
                    ...settings,
                    mockAiResponse: !settings.mockAiResponse,
                  })
                }
              />
            </div>
           )
        }

        <DialogFooter>
          <DialogClose>Save</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
