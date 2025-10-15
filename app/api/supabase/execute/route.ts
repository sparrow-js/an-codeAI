import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { executeSupabaseSQLWithPostgres } from '@/supabase';
import { db } from '@/db';
import { cloud } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { decryptCloudRecord } from '@/lib/db-encryption';

export async function POST(request: Request) {
  try {
    // 验证用户身份
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 获取请求体
    const body = await request.json();
    const { query, chatId } = body;
    console.log('chatId *********', chatId);
    console.log('query *********', query);

    // 验证必需参数
    if (!query) {
      return NextResponse.json(
        { error: 'SQL query is required' },
        { status: 400 }
      );
    }

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // 根据 chatId 获取项目信息
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
    const { projectId, dbPassword } = decryptedRecord;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID not found' },
        { status: 404 }
      );
    }

    if (!dbPassword) {
      return NextResponse.json(
        { error: 'Database password not found for this project' },
        { status: 404 }
      );
    }

    // 执行 SQL 查询
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
    const result = await executeSupabaseSQLWithPostgres(
      projectId,
      dbPassword,
      query,
      accessToken
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          message: 'Failed to execute SQL query' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'SQL query executed successfully',
    });
  } catch (error: any) {
    console.error('Error in execute SQL API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to execute SQL query' },
      { status: 500 }
    );
  }
}
