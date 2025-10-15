import { Annotation } from "@langchain/langgraph";
import { GenerativeUIAnnotation } from "../types";

export const CloneUrlToCodeAnnotation = Annotation.Root({
  messages: GenerativeUIAnnotation.spec.messages,
  ui: GenerativeUIAnnotation.spec.ui,
  timestamp: GenerativeUIAnnotation.spec.timestamp,
  screenshotUrl: GenerativeUIAnnotation.spec.screenshotUrl,
  HtmlContext: GenerativeUIAnnotation.spec.HtmlContext,
  url: GenerativeUIAnnotation.spec.url,
  dataStream: GenerativeUIAnnotation.spec.dataStream,
  appId: GenerativeUIAnnotation.spec.appId,
  originalMessages: GenerativeUIAnnotation.spec.originalMessages,
  workspaceId: GenerativeUIAnnotation.spec.workspaceId,
});

export type CloneUrlToCodeState = typeof CloneUrlToCodeAnnotation.State;
export type CloneUrlToCodeUpdate = typeof CloneUrlToCodeAnnotation.Update;
