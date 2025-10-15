import { ChatOpenAI } from "@langchain/openai";
import type { IdeaToCodeState, IdeaToCodeUpdate } from "../types";
import { getSystemPrompt, CONTINUE_PROMPT } from "./prompts";
import { generateId } from "ai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { extractAllFilePathsAndContents, extractNpmInstall } from '@/utils/extract';
import { pushFiles } from '@/utils/git/push-files';
import { gitPullOriginMain } from '@/utils/machines';
import { createScopedLogger } from '@/utils/logger';
import { getFilePaths } from '@/lib/.server/llm/select-context';
import { db } from "@/db";
import { deploy, temporaryStorage, cloud } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { InferSelectModel } from 'drizzle-orm';
import { consumeCredits } from '@/utils/credits';
import { deployEdgeFunctionWithCode } from '@/supabase';
import { decryptCloudRecord } from '@/lib/db-encryption';


const logger = createScopedLogger('api.chat');

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
    ], {
      additionalBodyParams: {
        provider: {
          only: [
            'anthropic'
          ]
        },
      },      
    });

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
 * 处理从创意到代码的节点
 * @param state 当前状态
 * @returns 更新后的状态
 */
export async function ideaToCode(
  state: IdeaToCodeState
): Promise<Partial<IdeaToCodeUpdate>> {
  console.log("ideaToCode node running");
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
      model: "anthropic/claude-sonnet-4",
      maxTokens: 64000,
      apiKey: process.env.OPEN_ROUTER_API_KEY,
      streaming: true,
      timeout: 1000 * 60 * 10,
    }).withConfig({ tags: ["langsmith:nostream"] });

    // 从 cloud 表获取 Supabase 项目信息
    const chatIdStr = state.appId.replace('app-', '');
    let supabase = {
      projectId: '',
      publishableKey: '',
      url: '',
      hasSelectedProject: false,
    };
    let cloudData: any = null;

    try {
      const cloudResult = await db
          .select()
          .from(cloud)
          .where(eq(cloud.chatId, chatIdStr))
          .limit(1)
      
      if (cloudResult.length > 0) {
        // 解密敏感字段
        cloudData = await decryptCloudRecord(cloudResult[0]);
        supabase = {
          projectId: cloudData.projectId,
          publishableKey: cloudData.publishableKey || '',
          url: cloudData.supabaseUrl || '',
          hasSelectedProject: true,
        };
      }
    } catch (e) {
      console.error('Failed to fetch cloud info:', e);
    }

    // 格式化消息
    let systemPrompt = getSystemPrompt('', supabase);


    // const codeContext = createFilesContext(filteredFiles, true);
    const filePaths = getFilePaths(state.files);

    systemPrompt = `${systemPrompt}
    Below are all the files present in the project:
    ---
    ${filePaths.join('\n')}
    ---
    `;
    
    // if (summary) {
    //   systemPrompt = `${systemPrompt}
    //   below is the chat history till now
    //   CHAT SUMMARY:
    //   ---
    //   ${summary}
    //   ---
    //   `;
    // }

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
      const result = await db
          .select()
          .from(deploy)
          .where(eq(deploy.chatId, state.appId.replace('app-', '')))
          .limit(1)
      deployInfo = result[0] || null;
    } catch (e) {
      console.error('Failed to fetch deploy info:', e);
    }

    // 检查是否包含 Supabase Edge Function 文件并触发部署
    const supabaseFunctionPattern = /^supabase\/functions\/([^/]+)\/index\.ts$/;
    for (const file of filePathsAndContents) {
      const match = file.path.match(supabaseFunctionPattern);
      if (match) {
        const functionName = match[1];
        const functionCode = file.content;
        
        console.log(`检测到 Supabase Edge Function: ${functionName}`);
        
        try {
          // 使用已获取的项目信息
          if (cloudData && cloudData.projectId) {
            // 直接调用部署函数
            const result = await deployEdgeFunctionWithCode(
              cloudData.projectId,
              functionName,
              functionCode
            );

            if (result.success) {
              console.log(`成功部署 Edge Function: ${functionName}`, result.message);
              
              // 添加部署成功的注释
              state.dataStream.writeMessageAnnotation({
                type: 'edgeFunctionDeployed',
                functionName,
                message: result.message,
              });
            } else {
              console.error(`部署 Edge Function 失败: ${functionName}`, result.error);
            }
          } else {
            console.error(`未找到项目ID，无法部署 Edge Function: ${functionName}`);
          }
        } catch (error) {
          console.error(`部署 Edge Function 时出错: ${functionName}`, error);
        }
      }
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
      await db
        db.insert(temporaryStorage).values({
          eventName: 'deplay_repo_wait',
          key: state.appId.replace('app-', ''),
          value: {
            files: filePathsAndContents,
          },
        });
    }

    const messages = [
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
      messages,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("ideaToCode node error", error);
    return {
      timestamp: Date.now(),
    };
  }
}
