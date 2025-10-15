import { z } from "zod";
import { ALL_TOOL_DESCRIPTIONS } from "../index";
import type { SupervisorState, SupervisorUpdate } from "../types";
import { formatMessages } from "@/agent/utils/format-messages";
import { ChatOpenAI } from "@langchain/openai";

export async function router(
  state: SupervisorState,
): Promise<Partial<SupervisorUpdate>> {
  state.callback?.();

  state.dataStream.writeData({
    type: 'progress',
    label: 'summary',
    status: 'in-progress',
    order: 0,
    message: 'Analysing Request',
  });  
  // If this is a new session (no previous messages), route to startup
  if (state.messages.length === 1) {
    console.log("New session detected, routing to startup");
    return {
      next: "startup",
    };
  }

  
  // Check if startup has already been used in this session
  const startupAlreadyUsed = state.messages.length > 1;
  
  const routerDescription = `The route to take based on the user's input.
${ALL_TOOL_DESCRIPTIONS}
`;

  
  // Define possible routes
  const routeValues = startupAlreadyUsed 
    ? ["cloneUrlToCode", "ideaToCode", "screenshotToCode"] as const
    : ["startup", "cloneUrlToCode", "ideaToCode", "screenshotToCode"] as const;
    
  const routerSchema = z.object({
    route: z
      .enum(routeValues)
      .describe(routerDescription),
  });
  const routerTool = {
    name: "router",
    description: "A tool to route the user's query to the appropriate tool.",
    schema: routerSchema,
  };

  const llm = new ChatOpenAI({
    model: "anthropic/claude-sonnet-4",
    temperature: 0,
    apiKey: process.env.OPEN_ROUTER_API_KEY,
  })
    .bindTools([routerTool], { tool_choice: "router" })
    .withConfig({ tags: ["langsmith:nostream"] });

  // const llm = new ChatAnthropic({
  //   model: "claude-3-5-sonnet-20240620",
  //   temperature: 0,
  // })
  //   .bindTools([routerTool], { tool_choice: "router" })
  //   .withConfig({ tags: ["langsmith:nostream"] });

  const prompt = `You're a highly helpful AI assistant, tasked with routing the user's query to the appropriate tool.
You should analyze the user's input, and choose the appropriate tool to use.
${startupAlreadyUsed ? "Note: The startup tool has already been used in this session and cannot be used again." : ""}`;

  const allMessagesButLast = state.messages.slice(0, -1);
  const lastMessage = state.messages.at(-1);

  const formattedPreviousMessages = formatMessages(allMessagesButLast);
  const formattedLastMessage = lastMessage ? formatMessages([lastMessage]) : "";

  const humanMessage = `Here is the full conversation, excluding the most recent message:
  
${formattedPreviousMessages}

Here is the most recent message:

${formattedLastMessage}

Please pick the proper route based on the most recent message, in the context of the entire conversation.`;


  try {
    const response = await llm.invoke([
      { role: "system", content: prompt },
      { role: "user", content: humanMessage },
    ]);

    const toolCall = response.tool_calls?.[0]?.args as
      | z.infer<typeof routerSchema>
      | undefined;
    console.log('toolCall ********', toolCall?.route);
    if (!toolCall) {
      console.log("No tool call found in response")
      throw new Error("No tool call found in response");
    }
    return {
      next: toolCall.route,
    };
  } catch (error) {
    console.error('Error in router:', error);
    throw error;
  }
}