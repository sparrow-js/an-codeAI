import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { cloud } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { deployEdgeFunctionWithCode } from '@/supabase';

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
    const { chatId, functionName, functionCode } = body;

    if (!chatId || !functionName || !functionCode) {
      return NextResponse.json(
        { error: 'Chat ID, function name and code are required' },
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

    const { projectId } = cloudRecord[0];

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID not found' },
        { status: 404 }
      );
    }

    // 调用封装的部署函数
    const result = await deployEdgeFunctionWithCode(
      projectId,
      functionName,
      functionCode
    );

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false,
          error: result.error,
          message: result.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.message,
    });
  } catch (error) {
    console.error('Error deploying Edge Function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to deploy Edge Function';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

