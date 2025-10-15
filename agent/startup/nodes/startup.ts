import type { StartupState } from "../types";
import { getTemplates } from "@/utils/selectStarterTemplate";
import { STARTER_TEMPLATES } from "@/utils/constants";
import {v4 as uuidv4} from "uuid";
import { createOpenAI } from '@ai-sdk/openai';
import { Message } from 'ai';
import { deploy } from "@/lib/deploy";
import { extractAllFilePathsAndContents } from '@/utils/extract';
import { checkAndCleanupMachines, createMachine } from "@/utils/machinesManager";




export const startup = async (state: StartupState, options: { model?: string; temperature?: number } = {}) => {
  const messages = state.messages;  
  
  const anthropic = createOpenAI({
    apiKey: process.env.OPEN_ROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  try {
    // const { text } = await generateText({
    //   model: anthropic('anthropic/claude-3.5-sonnet'),
    //   system: starterTemplateSelectionPrompt(templates),
    //   messages: convertMessageStructure(convertToOpenAIMessages(messages))
    // });



    // Process with LLM
    // const { title } = parseSelectedTemplate(text) || {
    //   title: 'React + Vite + typescript',
    // };

    state.dataStream.writeData({
      type: 'progress',
      label: 'summary',
      status: 'in-progress',
      order: 0,
      message: 'startup',
    });

    const template = 'vite-ts-sass-template'
    const title = '';
    const templateData = STARTER_TEMPLATES.find(t => t.name === template);
    
    let templateMessages: Message[] = [];

    const temResp = await getTemplates(template, title).catch((e) => {
      return null;
    });


    const sourceRepoUrl = `https://github.com/${templateData?.githubRepo}`;
    const dockerImage = "registry.fly.io/needware-app:latest"

    const checkResult = await checkAndCleanupMachines();

    const machine = await createMachine(state.appId.replace('app-', ''));
      
    const deployResponse = await deploy(sourceRepoUrl, state.appId.replace('app-', ''), dockerImage);


    if (temResp) {
      const { assistantMessage, userMessage } = temResp;
      templateMessages = [
        {
          id: uuidv4(),
          role: 'assistant',
          content: assistantMessage,
        },
        {
          id: `${new Date().getTime()}`,
          role: 'user',
          content: `\n\n${userMessage}`,
          annotations: ['hidden'],
        },
      ]
      state.dataStream.writeData(templateMessages);
    }

    const messagesList = [...messages, ...templateMessages]

    const files: any = {};
    messagesList.forEach((message) => {
      if ('role' in message && message.role === 'assistant') {
          const list =extractAllFilePathsAndContents(message.content);
          list.forEach((item) => {
            files[`/home/project/${item.path}`] = {
              type: 'file',
              isBinary: false,
              content: item.content
            }
          });

      }
    });

    if (state.originalMessages && Array.isArray(state.originalMessages)) {
      state.originalMessages.push(...templateMessages);
    }

    return {
      messages: messagesList,
      timestamp: Date.now(),
      files
    };

  } catch (error) {
    console.log('startup error **********',error);
    throw error;
    // return {
    //   timestamp: Date.now()
    // };
  }
};
