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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs"
import Button from "./ui/button";
import Link from "next/link";
import { useRouter } from 'next/navigation';


interface Props {
  settings: Settings;
  setSettings: (newState: Settings) => void;
  openDialog: boolean;
  setOpenDialog: (newState: boolean) => void;
  saveJump?: string; 
}

function SettingsDialog({ settings, setSettings, openDialog, setOpenDialog, saveJump }: Props) {

  const [llm, setLlm] = useState<string>('openai');
  const [delayShowArrow, setDelayShowArrow] = useState<boolean>(false);
  const router = useRouter();
  
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
        <Tabs defaultValue="customKey">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customKey">custom key</TabsTrigger>
            <TabsTrigger value="login">login</TabsTrigger>
          </TabsList>
          <TabsContent value="customKey">
            <div className="min-h-[420px]">
            <div className="mb-4">
              Add your own key to use immediately, no login required.
            </div>
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
                  <Label className="flex item-center" htmlFor="gemini-llm">
                    <span className="mr-2">Gemini</span>
                    <RadioGroupItem  value="gemini" id="gemini-llm"/>
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
                    <p className="text-rose-500">The output effect is not good and it will not be maintained for the time being.</p>
                    <Label htmlFor="openai-api-key">
                      <div>Gemini API key</div>
                      <div className="font-light mt-2 leading-relaxed">
                        Only stored in your browser. Never stored on servers. Overrides
                        your .env config.
                      </div>
                    </Label>

                    <Input
                      id="Gemini-api-key"
                      placeholder="Gemini API key"
                      value={settings?.geminiApiKey || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          geminiApiKey: e.target.value,
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

            </div>
          </TabsContent>
          <TabsContent value="login">
            <div className="min-h-[420px] flex flex-col items-center justify-center">
              <p className="mb-5">Go to login and purchase.</p>
              <Link href="/sing-in">
                <Button>go login</Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <DialogClose>
            <Button onClick={() => {
              if (saveJump) {
                router.push(saveJump, { scroll: false })
              }
            }}>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
