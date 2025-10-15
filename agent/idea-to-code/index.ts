import {
  END,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { IdeaToCodeAnnotation } from "./types";
import { ideaToCode } from "./nodes/ideaToCode";

const workflow = new StateGraph(IdeaToCodeAnnotation)
  .addNode("ideaToCode", ideaToCode)
  .addEdge(START, "ideaToCode")
  .addEdge("ideaToCode", END);

export const graph = workflow.compile();
graph.name = "Idea To Code Graph";
