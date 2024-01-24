import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "./ui/select";
import { GeneratedCodeConfig } from "../types";

function generateDisplayComponent(config: GeneratedCodeConfig) {
  switch (config) {
    case GeneratedCodeConfig.HTML_TAILWIND:
      return (
        <div>
          <span className="font-semibold">HTML</span> +{" "}
          <span className="font-semibold">Tailwind</span>
        </div>
      );
    case GeneratedCodeConfig.REACT_NATIVE:
      return (
        <div>
          <span className="font-semibold">react</span> +{" "}
          <span className="font-semibold">native</span>
        </div>
      );  
    case GeneratedCodeConfig.REACT_TAILWIND:
      return (
        <div>
          <span className="font-semibold">React</span> +{" "}
          <span className="font-semibold">Tailwind</span>
        </div>
      );
    case GeneratedCodeConfig.REACT_SHADCN_UI:
      return (
        <div>
          <span className="font-semibold">React</span> +{" "}
          <span className="font-semibold">shadcn/ui</span>
          <span className="text-orange-600 ml-[20px]">Beta</span>
        </div>
      );
    case GeneratedCodeConfig.REACT_ANTD:
      return (
        <div>
          <span className="font-semibold">react</span> +{" "}
          <span className="font-semibold">antd</span>
        </div>
      );  
    case GeneratedCodeConfig.VUE_TAILWIND:
      return (
        <div>
          <span className="font-semibold">vue</span> +{" "}
          <span className="font-semibold">Tailwind</span>
        </div>
      );
    case GeneratedCodeConfig.VUE_ELEMENT:
      return (
        <div>
          <span className="font-semibold">vue</span> +{" "}
          <span className="font-semibold">element plus</span>
          <span className="text-orange-600 ml-[20px]">Beta</span>
        </div>
      );
    case GeneratedCodeConfig.BOOTSTRAP:
      return (
        <div>
          <span className="font-semibold">Bootstrap</span>
        </div>
      );
      // VUE_TAILWIND 
    // case GeneratedCodeConfig.IONIC_TAILWIND:
    //   return (
    //     <div>
    //       <span className="font-semibold">Ionic</span> +{" "}
    //       <span className="font-semibold">Tailwind</span>
    //     </div>
    //   );
    default:
      // TODO: Should never reach this out. Error out
      return config;
  }
}

interface Props {
  generatedCodeConfig: GeneratedCodeConfig;
  setGeneratedCodeConfig: (config: GeneratedCodeConfig) => void;
  shouldDisableUpdates?: boolean;
}

function OutputSettingsSection({
  generatedCodeConfig,
  setGeneratedCodeConfig,
  shouldDisableUpdates = false,
}: Props) {
  return (
    <div className="flex flex-col gap-y-2 justify-between text-sm">
      <div className="w-[200px]">
        <Select
          value={generatedCodeConfig}
          onValueChange={(value: string) =>
            setGeneratedCodeConfig(value as GeneratedCodeConfig)
          }
          disabled={shouldDisableUpdates}
        >
          <SelectTrigger className="col-span-2" id="output-settings-js">
            {generateDisplayComponent(generatedCodeConfig)}
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value={GeneratedCodeConfig.HTML_TAILWIND}>
                {generateDisplayComponent(GeneratedCodeConfig.HTML_TAILWIND)}
              </SelectItem>
              <SelectItem value={GeneratedCodeConfig.REACT_TAILWIND}>
                {generateDisplayComponent(GeneratedCodeConfig.REACT_TAILWIND)}
              </SelectItem>
              <SelectItem value={GeneratedCodeConfig.REACT_SHADCN_UI}>
                {generateDisplayComponent(GeneratedCodeConfig.REACT_SHADCN_UI)}
              </SelectItem>
              <SelectItem value={GeneratedCodeConfig.REACT_ANTD}>
                {generateDisplayComponent(GeneratedCodeConfig.REACT_ANTD)}
              </SelectItem>
              <SelectItem value={GeneratedCodeConfig.REACT_NATIVE}>
                {generateDisplayComponent(GeneratedCodeConfig.REACT_NATIVE)}
              </SelectItem>
              <SelectItem value={GeneratedCodeConfig.VUE_TAILWIND}>
                {generateDisplayComponent(GeneratedCodeConfig.VUE_TAILWIND)}
              </SelectItem>
              {/* <SelectItem value={GeneratedCodeConfig.VUE_ELEMENT}>
                {generateDisplayComponent(GeneratedCodeConfig.VUE_ELEMENT)}
              </SelectItem> */}
              <SelectItem value={GeneratedCodeConfig.BOOTSTRAP}>
                {generateDisplayComponent(GeneratedCodeConfig.BOOTSTRAP)}
              </SelectItem>
              {/* <SelectItem value={GeneratedCodeConfig.IONIC_TAILWIND}>
                {generateDisplayComponent(GeneratedCodeConfig.IONIC_TAILWIND)}
              </SelectItem> */}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// GeneratedCodeConfig {
//   HTML_TAILWIND = "html_tailwind",
//   REACT_TAILWIND = "react_tailwind",
//   REACT_SHADCN_UI = "react_shadcn_ui",
//   BOOTSTRAP = "bootstrap",
//   // IONIC_TAILWIND = "ionic_tailwind",
//   REACT_ANTD = "react_antd",
//   VUE_TAILWIND = 'vue_tailwind',
//   VUE_ELEMENT = 'vue_element',
//   REACT_NATIVE = 'react_native',
//   // VUE_ELEMENT_SYSTEM_PROMPT
// }

export const TechnologyStackList = [
  {
    label: GeneratedCodeConfig.HTML_TAILWIND,
    value: 'HTML + tailwind'
  },
  {
    label: GeneratedCodeConfig.REACT_TAILWIND,
    value: 'react + tailwind'
  },
  {
    label: GeneratedCodeConfig.REACT_SHADCN_UI,
    value: 'react + shadcn/ui'
  },
  {
    label: GeneratedCodeConfig.REACT_ANTD,
    value: 'react + antd'
  },
  {
    label: GeneratedCodeConfig.VUE_TAILWIND,
    value: 'vue + tailwind'
  },
  {
    label: GeneratedCodeConfig.VUE_ELEMENT,
    value: 'vue + element'
  },
  {
    label: GeneratedCodeConfig.REACT_NATIVE,
    value: 'react + native'
  },
  {
    label: GeneratedCodeConfig.BOOTSTRAP,
    value: 'bootstrap'
  }
]



export default OutputSettingsSection;
