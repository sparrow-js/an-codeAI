import type { ScreenshotToCodeState, ScreenshotToCodeUpdate } from "../types";
import { getSystemPrompt, CONTINUE_PROMPT } from "./prompts";
import { generateId } from "ai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { extractAllFilePathsAndContents } from '@/utils/extract';
import { pushFiles } from '@/utils/git/push-files';
import { gitPullOriginMain } from '@/utils/machines';
import { withDb } from "@/db";
import { deploy, temporaryStorage } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';
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
 * 处理从截图到代码的节点
 * @param state 当前状态
 * @returns 更新后的状态
 */
export async function screenshotToCode(
  state: ScreenshotToCodeState
): Promise<Partial<ScreenshotToCodeUpdate>> {
  console.log("screenshotToCode node running");
  
  try {
    const annotations: any[] = [];

    await consumeCredits(state.workspaceId, 1);


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

    // 使用新的完整响应获取函数，自动处理token限制
    const completeResponseContent = await getCompleteResponse(
      llm,
      state.messages,
      systemPrompt,
      3 // 最多继续3次
    );

    const installDependencies = extractNpmInstall(completeResponseContent);
    const filePathsAndContents = extractAllFilePathsAndContents(completeResponseContent);


    // 获取deploy信息
    let deployInfo: InferSelectModel<typeof deploy> | null = null;
    try {
      const result = await withDb(db =>
        db
          .select()
          .from(deploy)
          .where(eq(deploy.chatId, state.appId.replace('app-', '')))
          .limit(1)
      );
      deployInfo = result[0] || null;
    } catch (e) {
      console.error('Failed to fetch deploy info:', e);
    }

    if (deployInfo?.repoStatus === 'pushed') {
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
    } else {
      await withDb(db =>
        db.insert(temporaryStorage).values({
          eventName: 'deplay_repo_wait',
          key: state.appId.replace('app-', ''),
          value: {
            files: filePathsAndContents,
          },
        })
      );
    }
    
    const messages =  [
      {
        id: generateId(),
        role: "assistant",
        content: completeResponseContent,
        annotations,
      },
    ];

    if (state.originalMessages && Array.isArray(state.originalMessages)) {
      state.originalMessages.push(...messages);
    }


    return {
      messages: messages,
      timestamp: Date.now(),
    };
  } catch (error) {
    throw error;
  }
}
