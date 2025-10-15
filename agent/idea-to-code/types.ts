import { Annotation } from "@langchain/langgraph";
import { GenerativeUIAnnotation } from "../types";

export const IdeaToCodeAnnotation = Annotation.Root({
  messages: GenerativeUIAnnotation.spec.messages,
  ui: GenerativeUIAnnotation.spec.ui,
  timestamp: GenerativeUIAnnotation.spec.timestamp,
  dataStream: GenerativeUIAnnotation.spec.dataStream,
  appId: GenerativeUIAnnotation.spec.appId,
  files: GenerativeUIAnnotation.spec.files,
  originalMessages: GenerativeUIAnnotation.spec.originalMessages,
  workspaceId: GenerativeUIAnnotation.spec.workspaceId,
});

export type IdeaToCodeState = typeof IdeaToCodeAnnotation.State;
export type IdeaToCodeUpdate = typeof IdeaToCodeAnnotation.Update;
