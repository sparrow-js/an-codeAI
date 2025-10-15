import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { cloud } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { decryptCloudRecord } from '@/lib/db-encryption';

export async function GET(request: Request) {
  try {
    // 验证用户身份
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 从 URL 参数获取 chatId
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // 查询 cloud 表获取项目信息
    const cloudRecord = await db
      .select()
      .from(cloud)
      .where(eq(cloud.chatId, chatId))
      .limit(1);

    if (!cloudRecord || cloudRecord.length === 0) {
      return NextResponse.json(
        { error: 'Project not found for this chat' },
        { status: 404 }
      );
    }

    // 解密敏感字段
    const decryptedRecord = await decryptCloudRecord(cloudRecord[0]);
    const { dbPassword, projectId } = decryptedRecord;

    if (!projectId || !dbPassword) {
      return NextResponse.json(
        { error: 'Project credentials not found' },
        { status: 404 }
      );
    }

    // 使用 SQL 查询获取存储桶
    const { executeSupabaseSQLWithPostgres } = await import('@/supabase');
    
    const query = `
      SELECT 
        name,
        id,
        public,
        created_at
      FROM storage.buckets
      ORDER BY created_at DESC;
    `;

    const result = await executeSupabaseSQLWithPostgres(
      projectId,
      dbPassword,
      query
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch buckets' },
        { status: 500 }
      );
    }

    const buckets = (result.data || []).map((row: any) => ({
      name: row.name,
      id: row.id,
      public: row.public,
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: buckets,
    });
  } catch (error: any) {
    console.error('Error fetching buckets:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch buckets' },
      { status: 500 }
    );
  }
}

