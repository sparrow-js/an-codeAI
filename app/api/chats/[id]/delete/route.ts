import { NextResponse } from "next/server";
import { db } from '@/db';
import { chats, deploy } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "auth";
import { deleteFlyApp } from "@/utils/machines";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 类型定义
) {
  try {
    const { id: chatId } = await params;

    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
    const existingChat = await db.select()
    .from(chats)
    .where(
      and(
        eq(chats.id, chatId),
        eq(chats.userId, session.user.id)
      )
    )
    .limit(1);

  if (!existingChat || existingChat.length === 0) {
    return new NextResponse("Chat not found", { status: 404 });
  }

  // Delete the chat
  const deletedChat = await db.delete(chats)
    .where(
      and(
        eq(chats.id, chatId),
        eq(chats.userId, session.user.id)
      )
    )
    .returning();

  if (!deletedChat || deletedChat.length === 0) {
    return new NextResponse("Failed to delete chat", { status: 500 });
  }

  // 检查并删除对应的 Fly 应用
  try {
    // 从 metadata 中获取 Fly 应用名称，或者使用 chatId 作为应用名称
    const flyAppName = `${chatId}`;

    
    // 尝试删除 Fly 应用
    const res = await deleteFlyApp(flyAppName);
    await db.update(deploy)
    .set({ machineStatus: 'delete' })
    .where(eq(deploy.chatId, chatId));
    console.log(`Successfully deleted Fly app: ${flyAppName}`, res);
  } catch (flyError) {
    // 如果删除 Fly 应用失败，记录错误但不影响聊天删除的成功
    console.warn(`Failed to delete Fly app for chat ${chatId}:`, flyError);
  }

  return NextResponse.json(deletedChat[0]);

  } catch (error) {
    console.error("[CHAT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
