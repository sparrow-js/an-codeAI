import { NextRequest, NextResponse } from 'next/server';
import { withDb } from '@/db'; // Adjusted import path
import { chats } from '@/db/schema'; // Adjusted import path
import { eq, and } from 'drizzle-orm';
import { auth } from "auth";

const isUUID = (str: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };
  

export async function GET(request: NextRequest,
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
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const chat = await withDb((db) =>
    db
      .select()
      .from(chats)
      .where(
        and(
          isUUID(id) ? eq(chats.id, id) : eq(chats.shortId, id),
          eq(chats.userId, userId)
        )
      )
      .limit(1)
  );

  if (!chat.length) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  return NextResponse.json({
    messages: chat[0].messages,
    description: chat[0].description,
    exportDate: new Date().toISOString(),
  }, { status: 200 });
}