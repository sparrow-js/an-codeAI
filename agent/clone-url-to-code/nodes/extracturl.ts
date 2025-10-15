import type { CloneUrlToCodeState, CloneUrlToCodeUpdate } from "../types";
import { isBaseMessage } from "@langchain/core/messages";
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

/**
 * 从消息中提取URL
 * @param state 当前状态
 * @returns 更新后的状态，包含提取的URL
 */
export async function extractUrl(
  state: CloneUrlToCodeState
): Promise<Partial<CloneUrlToCodeUpdate>> {
  console.log("extractUrl node running");
  
  state.dataStream.writeData({
    type: 'progress',
    label: 'summary',
    status: 'in-progress',
    order: 0,
    message: 'Extracting URL',
  });
  // 收集所有用户消息
  const userMessages = state.messages.filter(msg => 
    isBaseMessage(msg) && msg.getType() === "human");
  if (userMessages.length === 0) {
    return {
      messages: [
        {
          role: "assistant",
          content: "无法找到有效的用户消息。请提供包含URL的消息。",
        },
      ],
      timestamp: Date.now(),
    };
  }
  
  // 将所有用户消息合并成一个上下文
  const conversationContext = userMessages
    .map(msg => typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content))
    .join("\n\n");
  
  if (!conversationContext || conversationContext.trim() === '') {
    return {
      messages: [
        {
          role: "assistant",
          content: "无法找到有效的用户消息内容。请提供包含URL的消息。",
        },
      ],
      timestamp: Date.now(),
    };
  }

  try {

    const prompt = `
    您的任务是从整个对话上下文中提取用户最可能想要克隆或处理的URL。请遵循以下规则：
    1. 分析整个对话上下文，理解用户的意图
    2. 如果上下文中包含多个URL，选择最相关的一个（通常是最近提到的或与"克隆"、"网站"相关的URL）
    3. 只返回URL本身，不要添加任何其他内容
    4. 如果没有找到URL，请回复"NO_URL_FOUND"
    5. 如果url不包含https://，请添加https://
    
    对话上下文: 
    "${conversationContext}"
    `;

    const anthropic = createOpenAI({
      apiKey: process.env.OPEN_ROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const { text } = await generateText({
      model: anthropic('anthropic/claude-3.7-sonnet'),
      system: "您是一个URL提取助手，专门负责从复杂的对话上下文中理解用户意图并提取相关URL。" ,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const extractedText = text.toString().trim();

    // 验证提取的内容是否为有效URL
    if (extractedText === "NO_URL_FOUND") {
      return {
        messages: [
          {
            role: "assistant",
            content: "在对话中未找到有效的URL。请提供包含有效URL的消息。",
          },
        ],
        timestamp: Date.now(),
      };
    }
    
    // 使用正则表达式验证提取的URL
    const urlRegex = /^(https?:\/\/[^\s]+)$/;
    if (!urlRegex.test(extractedText)) {
      // 回退到正则表达式提取整个对话内容
      const matches = conversationContext.match(/(https?:\/\/[^\s]+)/g);
      if (!matches || matches.length === 0) {
        return {
          messages: [
            {
              role: "assistant",
              content: "在对话中未找到有效的URL。请提供包含有效URL的消息。",
            },
          ],
          timestamp: Date.now(),
        };
      }
      
      // 使用正则表达式提取的最后一个URL（假设最近提到的URL最相关）
      const lastUrl = matches[matches.length - 1];
      return {
        url: lastUrl,
        timestamp: Date.now(),
      };
    }    

    return {
      url: extractedText,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("URL提取错误:", error);
    
    // 错误时使用正则表达式作为备用方法
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = conversationContext.match(urlRegex);
    
    if (!matches || matches.length === 0) {
      return {
        messages: [
          {
            role: "assistant",
            content: "在对话中未找到有效的URL。请提供包含有效URL的消息。",
          },
        ],
        timestamp: Date.now(),
      };
    }
    
    // 使用最后一个URL（假设最近提到的URL最相关）
    const lastUrl = matches[matches.length - 1];

    return {
      url: lastUrl,
      timestamp: Date.now(),
    };
  }
}
