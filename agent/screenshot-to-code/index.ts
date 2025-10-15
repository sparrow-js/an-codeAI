import {
  END,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { ScreenshotToCodeAnnotation } from "./types";
import { screenshotToCode } from "./nodes/screenshotToCode";

const workflow = new StateGraph(ScreenshotToCodeAnnotation)
  .addNode("screenshotToCode", screenshotToCode)
  .addEdge(START, "screenshotToCode")
  .addEdge("screenshotToCode", END);

export const graph = workflow.compile();
graph.name = "Screenshot To Code Graph";
