import { StartupAnnotation } from "./types";
import { StateGraph, START, END } from "@langchain/langgraph";
import { startup } from "./nodes/startup";

// Create the graph
const workflow = new StateGraph(StartupAnnotation)
  .addNode("startup", (state) => startup(state, { 
    model: "anthropic/claude-3-7-sonnet-latest", 
    temperature: 0.7
  }))
  .addEdge(START, "startup")
  .addEdge("startup", END);

// Compile the graph
export const graph = workflow.compile();
graph.name = "Startup Agent";
