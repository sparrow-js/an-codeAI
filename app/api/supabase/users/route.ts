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

    // 使用 SQL 查询获取用户统计和列表
    const { executeSupabaseSQLWithPostgres } = await import('@/supabase');
    
    // 获取用户列表
    const usersQuery = `
      SELECT 
        id,
        email,
        phone,
        created_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data
      FROM auth.users
      ORDER BY created_at DESC
      LIMIT 100;
    `;

    const usersResult = await executeSupabaseSQLWithPostgres(
      projectId,
      dbPassword,
      usersQuery
    );

    if (!usersResult.success) {
      return NextResponse.json(
        { error: usersResult.error || 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // 获取注册统计（最近30天）
    const signupsQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM auth.users
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC;
    `;

    const signupsResult = await executeSupabaseSQLWithPostgres(
      projectId,
      dbPassword,
      signupsQuery
    );

    const users = usersResult.data || [];
    const signups = signupsResult.success ? (signupsResult.data || []) : [];

    return NextResponse.json({
      success: true,
      data: {
        count: users.length,
        users: users.map((user: any) => ({
          id: user.id,
          email: user.email,
          phone: user.phone,
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at,
          providers: user.raw_app_meta_data?.providers || ['email'],
        })),
        signups: signups.map((s: any) => ({
          date: typeof s.date === 'string' ? s.date : new Date(s.date).toISOString().split('T')[0],
          count: parseInt(s.count) || 0,
        })),
      },
    });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

