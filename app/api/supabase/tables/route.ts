import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { cloud } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createClient } from '@supabase/supabase-js';
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
    const { supabaseUrl, publishableKey, dbPassword, projectId } = decryptedRecord;

    if (!supabaseUrl || !publishableKey) {
      return NextResponse.json(
        { error: 'Supabase credentials not found' },
        { status: 404 }
      );
    }

    // 创建 Supabase 客户端（使用 service_role key 或通过 SQL 查询）
    // 由于我们需要访问 pg_stat_user_tables，使用 SQL 查询更合适
    const { executeSupabaseSQLWithPostgres } = await import('@/supabase');
    
    const query = `
      SELECT 
        schemaname,
        relname as tablename,
        n_live_tup as row_count
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY relname;
    `;

    const result = await executeSupabaseSQLWithPostgres(
      projectId,
      dbPassword || '',
      query
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch tables' },
        { status: 500 }
      );
    }

    const tables = (result.data || []).map((row: any) => ({
      name: row.tablename,
      rowCount: parseInt(row.row_count) || 0,
      schema: row.schemaname,
    }));

    return NextResponse.json({
      success: true,
      data: tables,
    });
  } catch (error: any) {
    console.error('Error fetching tables:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch tables' },
      { status: 500 }
    );
  }
}

