
import { BsGithub } from "react-icons/bs";
import SettingsDialog from './SettingsDialog';
import {SettingContext} from '../contexts/SettingContext'
import {useContext, useState} from 'react';
import OutputSettingsSection from './OutputSettingsSection';
import {GeneratedCodeConfig} from '../types'
import { MdOutlineHelp } from "react-icons/md";
import { SiBuymeacoffee } from "react-icons/si";

export default () => {
  const { settings, setSettings } = useContext(SettingContext);

  return (
    <header className="flex items-center p-4 justify-between relative">
      <div>
        <img className="w-[40px] h-[40px] left-5" src="/logo.png" />
      </div>
      <div className="flex items-center">
        <div className="flex-1">
          <ul className="hidden md:flex float-right text-lg text-slate-700 items-center">
            <li className="mx-2">
                <OutputSettingsSection
                  generatedCodeConfig={settings.generatedCodeConfig}
                  setGeneratedCodeConfig={(config: GeneratedCodeConfig) =>
                    setSettings({
                      ...settings,
                      generatedCodeConfig: config,
                    })
                  }
                />
            </li>
            <li className="mx-2">
              <span>
                <SettingsDialog settings={settings} setSettings={setSettings} />
              </span>
            </li>
            <li className="mr-2 hover:bg-slate-200 rounded-sm p-2">
                <a
                  href="https://github.com/sparrow-js/ant-codeAI/blob/main/README.md"
                  target="_blank"
                >
                  <MdOutlineHelp className="text-xl" />
                </a>
            </li>
            <li className="mx-2">
                <a
                  href="https://github.com/sparrow-js/ant-codeAI"
                  target="_blank"
                  className="hover:text-[#2752f4]"
                >
                  <BsGithub className="text-xl" />
                </a>
            </li>
            <li className="mx-2">
              <a href="https://www.buymeacoffee.com/sparrowwhtl" target="_blank">
                <SiBuymeacoffee className="text-xl"/>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};
