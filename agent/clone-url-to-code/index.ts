import {
    END,
    LangGraphRunnableConfig,
    START,
    StateGraph,
  } from "@langchain/langgraph";
import { CloneUrlToCodeAnnotation } from "./types";
import { cloneUrlToCode } from "./nodes/cloneUrlToCode";
import { extractUrl } from "./nodes/extracturl";
import { firecrawl } from "./nodes/firecrawl";

const workflow = new StateGraph(CloneUrlToCodeAnnotation)
        .addNode("extractUrl", extractUrl)
        .addNode("firecrawl", firecrawl)
        .addNode("cloneUrlToCode", cloneUrlToCode)
        .addEdge(START, "extractUrl")
        .addEdge("extractUrl", "firecrawl")
        .addEdge("firecrawl", "cloneUrlToCode")
        .addEdge("cloneUrlToCode", END)

export const graph = workflow.compile();
graph.name = "Clone Url To Code Graph";