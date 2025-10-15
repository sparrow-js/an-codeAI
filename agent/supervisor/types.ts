import "@langchain/langgraph/zod";
import { z } from "zod";
import { Annotation } from "@langchain/langgraph";
import { GenerativeUIAnnotation } from "../types";

export const SupervisorAnnotation = Annotation.Root({
  ...GenerativeUIAnnotation.spec,
  dataStream: GenerativeUIAnnotation.spec.dataStream,
  appId: Annotation<string>(),
  originalMessages: Annotation<any[]>(),
  workspaceId: Annotation<string>(),
});

export type SupervisorState = typeof SupervisorAnnotation.State;
export type SupervisorUpdate = typeof SupervisorAnnotation.Update;

export const SupervisorZodConfiguration = z.object({
  /**
   * The model ID to use for the reflection generation.
   * Should be in the format `provider/model_name`.
   * Defaults to `anthropic/claude-3-7-sonnet-latest`.
   */
  model: z
    .string()
    .optional()
    .langgraph.metadata({
      type: "select",
      default: "anthropic/claude-3-7-sonnet-latest",
      description: "The model to use in all generations",
      options: [
        {
          label: "Claude 3.7 Sonnet",
          value: "anthropic/claude-3-7-sonnet-latest",
        },
        {
          label: "Claude 3.5 Sonnet",
          value: "anthropic/claude-3-5-sonnet-latest",
        },
        {
          label: "GPT 4o",
          value: "openai/gpt-4o",
        },
        {
          label: "GPT 4.1",
          value: "openai/gpt-4.1",
        },
        {
          label: "o3",
          value: "openai/o3",
        },
        {
          label: "o3 mini",
          value: "openai/o3-mini",
        },
        {
          label: "o4",
          value: "openai/o4",
        },
      ],
    }),
  /**
   * The temperature to use for the reflection generation.
   * Defaults to `0.7`.
   */
  temperature: z.number().optional().langgraph.metadata({
    type: "slider",
    default: 0.7,
    min: 0,
    max: 2,
    step: 0.1,
    description: "Controls randomness (0 = deterministic, 2 = creative)",
  }),
  /**
   * The maximum number of tokens to generate.
   * Defaults to `1000`.
   */
  maxTokens: z.number().optional().langgraph.metadata({
    type: "number",
    default: 1000,
    min: 1,
    description: "The maximum number of tokens to generate",
  }),
  systemPrompt: z.string().optional().langgraph.metadata({
    type: "textarea",
    placeholder: "Enter a system prompt...",
    description: "The system prompt to use in all generations",
  }),
});
