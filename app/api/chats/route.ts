import { NextResponse } from 'next/server';
import { chats, deploy, workspaces } from '@/db/schema';
import type { Message } from 'ai';
import type { IChatMetadata, ArtifactSnapshot } from '@/lib/persistence/types';
import { auth } from 'auth';
import { desc, eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { nanoid, customAlphabet } from 'nanoid';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', {
      status: 401,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  const userId = session.user.id;
  const url = new URL(request.url);
  const workspaceId = url.searchParams.get('workspaceId');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '8');

  // 如果没有提供 workspaceId，返回错误
  if (!workspaceId) {
    return NextResponse.json({ error: 'WorkspaceId is required' }, { status: 400 });
  }

  // 验证分页参数
  if (page < 1 || limit < 1 || limit > 100) {
    return NextResponse.json({ 
      error: 'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100' 
    }, { status: 400 });
  }

  const offset = (page - 1) * limit;

  try {
    // 获取总数
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(chats)
      .where(eq(chats.workspaceId, workspaceId));

    const totalCount = totalCountResult[0]?.count || 0;

    // 获取分页数据
    const result = await db
      .select({
        id: chats.id,
        userId: chats.userId,
        description: chats.description,
        previewImageUrl: chats.previewImageUrl,
        timestamp: chats.createdAt,
        metadata: chats.metadata,
        status: chats.status,
      })
      .from(chats)
      .where(eq(chats.workspaceId, workspaceId))
      .orderBy(desc(chats.createdAt))
      .limit(limit)
      .offset(offset);

    // 计算分页信息
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      data: result,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      }
    });
  } catch (error) {
    console.error('Failed to fetch chats:', error);
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let { id, messages, urlId, description, timestamp, metadata, status, artifactSnapshots, workspaceId } = await request.json() as {
    id: string;
    messages?: Message[];
    urlId?: string;
    description?: string;
    timestamp?: string;
    metadata?: IChatMetadata;
    status?: string;
    artifactSnapshots?: ArtifactSnapshot[]; // 新增：Artifact 快照
    workspaceId?: string;
  };

  let isDeployInsert = false;
  let visibility = 'PRIVATE'; // 默认为私有

  if (!id) {
    isDeployInsert = true;
    id = uuidv4();
  }

  try {

    // 检查 workspace plan，如果是免费（FREE）则只允许有一个 chat，并设置可见性
    if (workspaceId) {
      try {
        // 查询 workspace 的 plan
        const workspace = await db
          .select()
          .from(workspaces)
          .where(eq(workspaces.id, workspaceId))
          .limit(1);
        
        const workspaceData = workspace[0];

        if (workspaceData?.plan === 'FREE') {
          // FREE 计划设为 PUBLIC
          visibility = 'PUBLIC';
          
          // 统计该 workspace 下的 chat 数量
          const chatCountResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(chats)
            .where(eq(chats.workspaceId, workspaceId));
          
          const chatCount = chatCountResult[0]?.count || 0;

          // 如果是新增（不是更新）且已有 chat，则拒绝
          if (isDeployInsert && chatCount >= 1) {
            return NextResponse.json(
              { error: 'Free plan only allows one project per workspace.' },
              { status: 403 }
            );
          }
        } else {
          // 其他计划设为 PRIVATE
          visibility = 'PRIVATE';
        }
      } catch (error) {
        console.error('Error checking workspace plan:', error);
        // 如果查询失败，继续执行，不阻止用户操作
      }
    }

    const result = await db
    .insert(chats)
    .values({
      id,
      ...(messages !== undefined && { messages }),
      shortId: customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 12)(),
      createdAt: timestamp ? new Date(timestamp) : new Date(),
      metadata,
      status: status !== undefined ? status : 'init',
      artifactSnapshots, // 新增：保存快照
      userId: session?.user?.id || 'guest',
      workspaceId: workspaceId,
      visibility: visibility as 'PRIVATE' | 'PUBLIC' | 'WORKSPACE_ONLY', // 设置可见性
    })
    .onConflictDoUpdate({
      target: chats.id,
      set: {
        ...(messages !== undefined && { messages }),
        description,
        metadata,
        createdAt: timestamp ? new Date(timestamp) : new Date(),
        ...(status !== undefined && { status }),
        artifactSnapshots, // 新增：更新快照
        // 注意：更新时不改变 visibility，只在创建时设置
      },
    })
    .returning();

    console.log('**************isDeployInsert', isDeployInsert);
    if (isDeployInsert) {
      await db.insert(deploy).values({
        id,
        userId: session?.user?.id || 'guest',
        status: 'init',
        hostingStatus: 'init',
        machineStatus: 'init',
        repoStatus: 'init',
        chatId: id,
        updatedAt: new Date(),
      });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Failed to save chat:', error);
    return NextResponse.json({ error: 'Failed to save chat' }, { status: 500 });
  }
}