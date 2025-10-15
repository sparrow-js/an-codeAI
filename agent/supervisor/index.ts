import { StateGraph, START, END } from "@langchain/langgraph";
import {
    SupervisorAnnotation,
    SupervisorState,
    SupervisorZodConfiguration,
  } from "./types";
import { graph as cloneUrlToCode } from "../clone-url-to-code";
import { graph as ideaToCode } from "../idea-to-code";
import { graph as screenshotToCode } from "../screenshot-to-code";
import { graph as startup } from "../startup";

// import { setGlobalDispatcher, ProxyAgent } from "undici";
// 设置代理
// const dispatcher = new ProxyAgent({ uri: new URL("http://127.0.0.1:7890").toString() });
// setGlobalDispatcher(dispatcher);

import { router } from "./nodes/router";
import { finish } from "./nodes/finish";
export const ALL_TOOL_DESCRIPTIONS = `
- ScreenshotToCode: can convert a screenshot to code
- IdeaToCode: can convert an idea or description to code
- CloneUrlToCode: can convert a clone url to code
- Startup: can select the best framework template for a new web project`;

function handleRoute(
    state: SupervisorState,
  ):
    | "startup"
    | "cloneUrlToCode"
    | "ideaToCode"
    | "screenshotToCode" {
    return state.next;
  }

const builder = new StateGraph(SupervisorAnnotation, SupervisorZodConfiguration)
  .addNode("router", router)
  .addNode("startup", startup)
  .addNode("cloneUrlToCode", cloneUrlToCode)
  .addNode("ideaToCode", ideaToCode)
  .addNode("screenshotToCode", screenshotToCode)
  .addNode("finish", finish)
  .addConditionalEdges("router", handleRoute, [
    "startup",
    "cloneUrlToCode",
    "ideaToCode",
    "screenshotToCode",
  ]).
  addEdge(START, "router")
  .addEdge("cloneUrlToCode", 'finish')
  .addEdge("ideaToCode", 'finish')
  .addEdge("screenshotToCode", 'finish')
  .addEdge("startup", "router")
  .addEdge("finish", END)
  


  export const graph = builder.compile();
  graph.name = "Generative UI Agent";