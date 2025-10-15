import type { CloneUrlToCodeState, CloneUrlToCodeUpdate } from "../types";
import { getSystemPrompt, CONTINUE_PROMPT } from "./prompts";
import { generateId } from "ai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { extractAllFilePathsAndContents } from '@/utils/extract';
import { pushFiles } from '@/utils/git/push-files';
import { gitPullOriginMain } from '@/utils/machines';
import { convertToOpenAIMessages } from "@/agent/utils/convert-message";
import { v4 as uuidv4 } from 'uuid';
import { checkCredits, consumeCredits } from '@/utils/credits';
import { extractNpmInstall } from '@/utils/extract';

/**
 * 检查响应是否因为token限制而被截断
 * @param content 响应内容
 * @returns 是否被截断
 */
function isResponseTruncated(content: string): boolean {
  // 检查常见的截断标志
  const truncationIndicators = [
    // 代码块未正确闭合
    /```[^`]*$/,  // 以未闭合的代码块结尾
    // HTML/XML标签未正确闭合
    /<[^/>]*$/,   // 以未闭合的标签结尾
    // 文件内容看起来不完整
    /\n\s*$/, // 以换行符和空白字符结尾可能表示被截断
    // 缺少明显的结束标记
    /<\/boltArtifact>$/i // 应该以这个标签结束
  ];

  // 如果内容太短，可能被截断
  if (content.length < 100) {
    return true;
  }

  // 检查是否以不完整的代码块结尾
  if (content.includes('```') && !content.endsWith('```')) {
    const codeBlockCount = (content.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) {
      return true;
    }
  }

  // 检查是否以不完整的标签结尾
  if (content.includes('<boltArtifact') && !content.includes('</boltArtifact>')) {
    return true;
  }

  // 检查是否以不完整的句子或代码结尾
  const lastLines = content.split('\n').slice(-3).join('\n');
  if (lastLines.match(/[,{(\[\s]$/)) {
    return true;
  }

  return false;
}

/**
 * 获取完整的LLM响应，如果被截断则继续请求
 * @param llm LLM实例
 * @param messages 消息列表
 * @param systemPrompt 系统提示
 * @param maxContinuations 最大继续次数
 * @returns 完整的响应内容
 */
async function getCompleteResponse(
  llm: any,
  messages: any[],
  systemPrompt: string,
  maxContinuations: number = 3
): Promise<string> {
  let completeContent = '';
  let currentMessages = [...messages];
  let continuationCount = 0;

  while (continuationCount <= maxContinuations) {
    console.log(`LLM调用 - 第${continuationCount + 1}次`);
    
    const response = await llm.invoke([
      { role: "system", content: systemPrompt },
      ...currentMessages
    ]);

    const responseContent = response.content as string;
    completeContent += responseContent;

    console.log(`响应长度: ${responseContent.length}, 累计长度: ${completeContent.length}`);

    // 检查是否被截断
    if (!isResponseTruncated(responseContent) && responseContent.length > 0) {
      console.log('响应完整，停止继续请求');
      break;
    }

    if (continuationCount >= maxContinuations) {
      console.log('达到最大继续次数，停止请求');
      break;
    }

    // 如果被截断，准备继续请求
    console.log('检测到响应被截断，准备继续请求...');
    
    // 添加AI响应到消息历史
    const aiMessage = new AIMessage({
      content: responseContent
    });
    currentMessages.push(aiMessage);

    // 添加继续提示
    const continueMessage = new HumanMessage({
      content: CONTINUE_PROMPT
    });
    currentMessages.push(continueMessage);

    continuationCount++;
  }

  return completeContent;
}

/**
 * 处理从URL克隆代码的节点
 * @param state 当前状态
 * @returns 更新后的状态
 */
export async function cloneUrlToCode(
  state: CloneUrlToCodeState
): Promise<Partial<CloneUrlToCodeUpdate>> {
  console.log("cloneUrlToCode node running", state.screenshotUrl, state.url);
  try {

    await consumeCredits(state.workspaceId, 3);


    const annotations: any[] = [];

    state.dataStream.writeData({
      type: 'progress',
      label: 'summary',
      status: 'in-progress',
      order: 0,
      message: 'Generating code',
    });


    // 初始化LLM
    const llm = new ChatOpenAI({
      model: "anthropic/claude-sonnet-4.5",
      maxTokens: 64000,
      apiKey: process.env.OPEN_ROUTER_API_KEY,
    }).withConfig({ tags: ["langsmith:nostream"] });
    
    const systemPrompt = getSystemPrompt();

    state.dataStream.write(`f:${JSON.stringify({messageId: generateId()})}\n`);

    // Ensure HtmlContext is at most 100000 characters
    const HtmlContext = state.HtmlContext || '';

    // Process HtmlContext to limit SVG tag lengths
    const processHtmlContext = (htmlContent: string): string => {
      const svgRegex = /<svg[\s\S]*?<\/svg>/gi;
      const matches = htmlContent.match(svgRegex);

      if (matches && matches.length > 0) {
        let processedHtml = htmlContent;
        let replacedCount = 0;
        
        // 遍历所有匹配的SVG标签
        matches.forEach((match) => {
          if (match.length > 1000) {
            // 替换为一个占位的svg
            const newSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#ccc"/></svg>`;
            processedHtml = processedHtml.replace(match, newSvg);
            replacedCount++;
          }
        });
        
        if (replacedCount > 0) {
          console.log(`已替换 ${replacedCount} 个SVG标签，减少内容长度`);
        }
        
        return processedHtml;
      }
      
      return htmlContent;
    };

    const processedHtmlContext = processHtmlContext(HtmlContext);

    // Limit processedHtmlContext to maximum 800,000 characters
    const MAX_HTML_LENGTH = 800000;
    const finalHtmlContext = processedHtmlContext.length > MAX_HTML_LENGTH 
      ? processedHtmlContext.substring(0, MAX_HTML_LENGTH) + '\n<!-- Content truncated due to length limit, Add the remaining code according to the picture  -->'
      : processedHtmlContext;

    if (processedHtmlContext.length > MAX_HTML_LENGTH) {
      console.log(`HTML内容超过${MAX_HTML_LENGTH}字符，已截断处理。原始长度: ${processedHtmlContext.length}, 截断后长度: ${finalHtmlContext.length}`);
    }

    const humanMessage = new HumanMessage({
      content: [
        {
          type: "text",
          text: `
I want to recreate the ${state.url} website as a complete React application based on the scraped content below. 
Based on the Provided Image and HTML Code

html code:
${finalHtmlContext}
          `
        },
        {
          type: 'image_url',
          image_url: {
            url: state.screenshotUrl
          }
        }
      ]
    });

    const messages = convertToOpenAIMessages([humanMessage]);
    (messages[0] as any).id = uuidv4();
    const cloneMessages = [
      {
       id: uuidv4(),
       role: 'user',
       content: [{
         type: "text",
         text: `Starting clone ${state.url}`
       },
       {
         type: 'image_url',
         image_url: {
           url: state.screenshotUrl
         }
       }]
      }
     ]
    state.dataStream.writeData(cloneMessages);

    if (state.originalMessages && Array.isArray(state.originalMessages)) {
      state.originalMessages.push(...cloneMessages);
    }


    state.messages.push(humanMessage)

    // 使用新的完整响应获取函数，自动处理token限制
    const completeResponseContent = await getCompleteResponse(
      llm,
      state.messages,
      systemPrompt,
      3 // 最多继续3次
    );

    const installDependencies = extractNpmInstall(completeResponseContent);
    const filePathsAndContents = extractAllFilePathsAndContents(completeResponseContent);

    const result = await pushFiles({
      token: process.env.NEXT_PUBLIC_GITHUB_TOKEN || '',
      owner: 'wordixai',
      repo: `repo-${state.appId.replace('app-', '')}`,
      files: filePathsAndContents,
      message: 'Update files',
    });

    // const isReInstall = filePathsAndContents.some(x => x.path.includes('package.json'));
    const isReInstall = false; // 不需要重新安装依赖
    const gitPullResult = await gitPullOriginMain(state.appId, isReInstall, installDependencies);  

    state.dataStream.writeData({
      type: 'progress',
      label: 'response',
      status: 'complete',
      order: 1,
      message: 'Response Generated',
    });
    state.dataStream.writeMessageAnnotation({
      type: 'commitSha',
      commitSha: result.commitSha || '',
    });
    annotations.push({
      type: 'commitSha',
      commitSha: result.commitSha || '',
    });


    const responseMessages = [
      {
        role: "assistant",
        content: completeResponseContent,
        annotations,
      },
    ];

    if (state.originalMessages && Array.isArray(state.originalMessages)) {
      state.originalMessages.push(...responseMessages);
    }

   



    return {
      messages: responseMessages,
      timestamp: Date.now(),
    };
  } catch (error: any) {
    console.error("cloneUrlToCode node error", error);
    state.dataStream.writeData({
      type: 'error',
      message: JSON.stringify(error),
    });
    throw error;
  }
}
