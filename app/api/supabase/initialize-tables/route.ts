import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { initializeSupabaseProjectTables } from '@/supabase';

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
    const { projectId, dbPassword, accessToken } = body;

    // 验证必需参数
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!dbPassword) {
      return NextResponse.json(
        { error: 'Database password is required' },
        { status: 400 }
      );
    }

    // 初始化表结构
    const result = await initializeSupabaseProjectTables(
      projectId,
      dbPassword,
      accessToken
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          error: result.error,
          message: result.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message || '表结构初始化成功',
    });
  } catch (error: any) {
    console.error('Error in initialize tables API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize tables' },
      { status: 500 }
    );
  }
}

