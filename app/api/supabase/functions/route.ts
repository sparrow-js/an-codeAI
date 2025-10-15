import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { cloud } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    const { projectId } = cloudRecord[0];

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID not found' },
        { status: 404 }
      );
    }

    // 使用 Supabase Management API 获取 Edge Functions
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Supabase access token not configured' },
        { status: 500 }
      );
    }

    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${projectId}/functions`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Edge Functions API might not be available or return 404
        // This is normal if no functions are deployed
        return NextResponse.json({
          success: true,
          data: [],
        });
      }

      const functions = await response.json();

      return NextResponse.json({
        success: true,
        data: Array.isArray(functions) ? functions : [],
      });
    } catch (apiError: any) {
      console.warn('Error fetching functions from API:', apiError);
      // Return empty array if API is not available
      return NextResponse.json({
        success: true,
        data: [],
      });
    }
  } catch (error: any) {
    console.error('Error fetching functions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch functions' },
      { status: 500 }
    );
  }
}

