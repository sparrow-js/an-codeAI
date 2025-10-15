import { Annotation } from "@langchain/langgraph";
import { GenerativeUIAnnotation } from "../types";

export const ScreenshotToCodeAnnotation = Annotation.Root({
  messages: GenerativeUIAnnotation.spec.messages,
  ui: GenerativeUIAnnotation.spec.ui,
  timestamp: GenerativeUIAnnotation.spec.timestamp,
  dataStream: GenerativeUIAnnotation.spec.dataStream,
  appId: GenerativeUIAnnotation.spec.appId,
  originalMessages: GenerativeUIAnnotation.spec.originalMessages,
  workspaceId: GenerativeUIAnnotation.spec.workspaceId,
});

export type ScreenshotToCodeState = typeof ScreenshotToCodeAnnotation.State;
export type ScreenshotToCodeUpdate = typeof ScreenshotToCodeAnnotation.Update;
