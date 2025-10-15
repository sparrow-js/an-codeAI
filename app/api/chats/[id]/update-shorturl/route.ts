import { NextResponse } from "next/server";
import { db } from '@/db';
import { chats } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { ChatHistoryItem } from "@/lib/persistence/types";
import { auth } from "auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 类型定义
) {

  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const userId = session.user.id;

  try {
    const body = await request.json();
    const { shortId } = body;

    if (!shortId) {
      return new NextResponse("Short ID is required", { status: 400 });
    }

    // Validate shortId
    const trimmedShortId = shortId.trim();
    if (trimmedShortId.length < 10 || trimmedShortId.length > 30) {
      return new NextResponse(
        "Short ID must be between 10 and 30 characters",
        { status: 400 }
      );
    }

    // Allow alphanumeric characters, hyphens, and underscores for short IDs
    if (!/^[a-zA-Z0-9\-_]+$/.test(trimmedShortId)) {
      return new NextResponse(
        "Short ID can only contain letters, numbers, hyphens, and underscores",
        { status: 400 }
      );
    }

    const { id: chatId } = await params;
    
    // 首先检查聊天是否存在
    const existingChat = await db.select()
      .from(chats)
      .where(
        and(
          eq(chats.id, chatId),
          eq(chats.userId, userId)
        )
      )
      .limit(1);
    
    if (!existingChat || existingChat.length === 0) {
      return new NextResponse("Chat not found", { status: 404 });
    }

    // 检查shortId是否已经被其他聊天使用
    const existingShortId = await db.select()
      .from(chats)
      .where(
        and(
          eq(chats.shortId, trimmedShortId),
          eq(chats.userId, userId)
        )
      )
      .limit(1);

    if (existingShortId.length > 0 && existingShortId[0].id !== chatId) {
      return new NextResponse("Short ID already exists", { status: 409 });
    }
    
    // 更新数据库中的聊天shortId
    const updatedChat = await db.update(chats)
      .set({ shortId: trimmedShortId })
      .where(
        and(
          eq(chats.id, chatId),
          eq(chats.userId, userId)
        )
      )
      .returning();
    
    if (!updatedChat || updatedChat.length === 0) {
      return new NextResponse("Failed to update chat", { status: 500 });
    }
    
    return NextResponse.json(updatedChat[0]);

  } catch (error) {
    console.error("[CHAT_SHORTID_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
