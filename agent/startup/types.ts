import { Annotation } from "@langchain/langgraph";
import { GenerativeUIAnnotation } from "../types";

export const StartupAnnotation = Annotation.Root({
  ...GenerativeUIAnnotation.spec,
  originalMessages: GenerativeUIAnnotation.spec.originalMessages
});

export type StartupState = typeof StartupAnnotation.State;
export type StartupUpdate = typeof StartupAnnotation.Update;

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  tags: string[];
  framework: string;
  language: string;
}
