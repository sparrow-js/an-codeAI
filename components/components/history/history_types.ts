export type HistoryItemType = "ai_create" | "ai_edit";

type CommonHistoryItem = {
  parentIndex: null | number;
  code: string;
  originPrompt?: string;
  screenshot?: string;
  isLock?: boolean;
};

export type HistoryItem =
  | ({
      type: "ai_create";
      inputs: AiCreateInputs;
    } & CommonHistoryItem)
  | ({
      type: "ai_edit";
      inputs: AiEditInputs;
    } & CommonHistoryItem);

export type AiCreateInputs = {
  image_url: string;
  initText: string;
  originMessage: string;
};

export type AiEditInputs = {
  prompt: string;
  originMessage: string;
};

export type History = HistoryItem[];
