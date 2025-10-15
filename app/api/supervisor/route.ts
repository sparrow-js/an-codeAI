import { LangChainAdapter, createDataStream, generateId } from 'ai';

import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { graph } from "@/agent/supervisor";
import { auth } from 'auth';
import { withDb } from '@/db/edge-db';
import { chats } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { checkCredits, consumeCredits } from '@/utils/credits';
import { hasMachineByChatId, redeployMachineById, getMachineStatus } from '@/utils/machinesManager';
import { redeploy } from '@/lib/deploy';
import { broadcast } from '@/utils/broadcast';
export const maxDuration = 800;

export async function POST(req: Request) {

  const {workspaceId, messages, appId, files} = await req.json();

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'Content-Type': 'text/plain' },
      });
    }


    // 检查是否有足够的积分
    const hasCredits = await checkCredits(workspaceId, 1);
    if (!hasCredits) {
      return new Response(JSON.stringify({
        error: 'No credits left'
        }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 更新 chats 表中对应用户的所有数据 status 为 'RUNNING'
    await withDb(db => db
      .update(chats)
      .set({ status: 'RUNNING' })
      .where(eq(chats.id, appId.replace('app-', '')))
    );




    const dataStream = createDataStream({
        async execute(dataStream) {
          dataStream.writeData({
            type: "text",
            text: "Supervisor started"
          });

          const machineStatus = await getMachineStatus(appId.replace('app-', ''));
          if (machineStatus !== null) {
            if (machineStatus === 'destroyed') {
              await broadcast(appId.replace('app-', ''), 'message', { 
                chatId: appId.replace('app-', ''),
                status: 'starting',
                type: 'redeploy',
                message: 'Starting live preview...',
              });
             await redeployMachineById(appId.replace('app-', ''), `https://github.com/wordixai/repo-${appId.replace('app-', '')}.git`);
            } else {
              await broadcast(appId.replace('app-', ''), 'message', { 
                chatId: appId.replace('app-', ''),
                status: 'created',
                type: 'redeploy',
                message: 'Live preview created',
              });
            }
          }

          try {
            const finalState = graph.streamEvents({
              messages: messages.map((msg: any) => msg.role === "user" ? new HumanMessage({
                content: msg.content
              }) : new AIMessage(msg.content)),
              callback: () => {
                  console.log("callback ********** supervisor");
              },
              originalMessages: messages,
              dataStream,
              appId,
              files,
              workspaceId,
            }, { 
              streamMode: "messages", 
              version: "v2",
              debug: true
            });
            
            return LangChainAdapter.mergeIntoDataStream(finalState, {
              dataStream
            });
          } catch (error) {
            console.error("Supervisor error: ", error);
            dataStream.writeData({
              type: "text",
              text: "Supervisor error: " + error
            });
          }
        }
    });
    return new Response(dataStream, {
        status: 200,
        headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache',
        'Transfer-Encoding': 'chunked',
        },
    });
}