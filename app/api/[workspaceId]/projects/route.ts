import { NextResponse } from 'next/server';
import { withDb} from '@/db/edge-db';
import { chats } from '@/db/schema';
import { auth } from 'auth';
import { desc, eq } from 'drizzle-orm';

export const runtime = 'edge';

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await auth();
  const { workspaceId } = await params;
  
  if (!session?.user?.id) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  try {
    const result = await withDb(db => db
      .select({
        id: chats.id,
        userId: chats.userId,
        description: chats.description,
        timestamp: chats.createdAt,
        metadata: chats.metadata,
        status: chats.status,
      })
      .from(chats)
      .where(eq(chats.workspaceId, workspaceId))
      .orderBy(desc(chats.createdAt))
      .limit(50)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}