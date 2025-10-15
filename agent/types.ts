import { MessagesAnnotation, Annotation } from "@langchain/langgraph";
import {
  RemoveUIMessage,
  UIMessage,
  uiMessageReducer,
} from "@langchain/langgraph-sdk/react-ui/server";

export const GenerativeUIAnnotation = Annotation.Root({
  messages: MessagesAnnotation.spec["messages"],
  ui: Annotation<
    UIMessage[],
    UIMessage | RemoveUIMessage | (UIMessage | RemoveUIMessage)[]
  >({ default: () => [], reducer: uiMessageReducer }),
  context: Annotation<Record<string, unknown> | undefined>,
  timestamp: Annotation<number>,
  screenshotUrl: Annotation<string | undefined>(),
  url: Annotation<string>(),
  HtmlContext: Annotation<string | undefined>(),
  callback: Annotation<() => void>(),
  dataStream: Annotation<any>(),
  appId: Annotation<string>(),
  originalMessages: Annotation<any[]>(),
  files: Annotation<any>(),
  workspaceId: Annotation<string>(),
  next: Annotation<
    | "cloneUrlToCode"
    | "ideaToCode"
    | "screenshotToCode"
    | "startup"
  >(),
});

export type GenerativeUIState = typeof GenerativeUIAnnotation.State;

export type Accommodation = {
  id: string;
  name: string;
  price: number;
  rating: number;
  city: string;
  image: string;
};

export type Price = {
  ticker: string;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  time: string;
};

export type Snapshot = {
  price: number;
  ticker: string;
  day_change: number;
  day_change_percent: number;
  market_cap: number;
  time: string;
};
