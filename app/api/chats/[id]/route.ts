import { NextResponse } from 'next/server';
import { db } from '@/db';
import { chats } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from 'auth';
import { checkCloudflareDeploymentStatus } from '@/utils/cloudflare';


export async function GET(
    request: Request, 
    { params }: { params: Promise<{ id: string }> } // 类型定义
) {
  const { id } = await params; // 从 params 中获取 id

  try {
    const session = await auth();
    if (!session) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    const chat = await db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.id, id),
          eq(chats.userId, session.user.id)
        )
      )
      .limit(1)

    const result = await checkCloudflareDeploymentStatus(`preview--${id}`);

    if (!chat.length) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({
      chat: chat[0],
      cloudflareDeploymentStatus: result
    });
  } catch (error) {
    console.error('Failed to fetch chat:', error);
    return NextResponse.json({ error }, { status: 500 });
  }
}