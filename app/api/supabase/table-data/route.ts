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

    // 从 URL 参数获取参数
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const tableName = searchParams.get('tableName');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    if (!chatId || !tableName) {
      return NextResponse.json(
        { error: 'Chat ID and table name are required' },
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
    const { projectId, dbPassword } = decryptedRecord;

    if (!projectId || !dbPassword) {
      return NextResponse.json(
        { error: 'Project credentials not found' },
        { status: 404 }
      );
    }

    const { executeSupabaseSQLWithPostgres } = await import('@/supabase');
    
    // 获取表的列信息
    const columnsQuery = `
      SELECT 
        c.column_name,
        c.data_type,
        c.is_nullable,
        c.column_default,
        COALESCE(
          (SELECT true 
           FROM information_schema.key_column_usage kcu
           JOIN information_schema.table_constraints tc
             ON kcu.constraint_name = tc.constraint_name
             AND kcu.table_schema = tc.table_schema
           WHERE kcu.table_schema = c.table_schema
             AND kcu.table_name = c.table_name
             AND kcu.column_name = c.column_name
             AND tc.constraint_type = 'PRIMARY KEY'
           LIMIT 1),
          false
        ) as is_primary
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = '${tableName}'
      ORDER BY c.ordinal_position;
    `;

    const columnsResult = await executeSupabaseSQLWithPostgres(
      projectId,
      dbPassword,
      columnsQuery
    );

    if (!columnsResult.success) {
      return NextResponse.json(
        { error: columnsResult.error || 'Failed to fetch columns' },
        { status: 500 }
      );
    }

    const columns = (columnsResult.data || []).map((col: any) => ({
      name: col.column_name,
      type: col.data_type,
      nullable: col.is_nullable === 'YES',
      defaultValue: col.column_default,
      isPrimary: col.is_primary,
    }));

    // 获取总行数
    const countQuery = `SELECT COUNT(*) as total FROM "${tableName}"`;
    const countResult = await executeSupabaseSQLWithPostgres(
      projectId,
      dbPassword,
      countQuery
    );

    const totalCount = countResult.success && countResult.data && countResult.data[0]
      ? parseInt(countResult.data[0].total)
      : 0;

    // 获取表数据（分页）
    const offset = (page - 1) * pageSize;
    const dataQuery = `SELECT * FROM "${tableName}" LIMIT ${pageSize} OFFSET ${offset}`;
    const dataResult = await executeSupabaseSQLWithPostgres(
      projectId,
      dbPassword,
      dataQuery
    );

    if (!dataResult.success) {
      return NextResponse.json(
        { error: dataResult.error || 'Failed to fetch data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        columns,
        rows: dataResult.data || [],
        totalCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching table data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch table data' },
      { status: 500 }
    );
  }
}

