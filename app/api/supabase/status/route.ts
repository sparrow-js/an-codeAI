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

    // 查询 cloud 表
    const cloudRecord = await db
      .select()
      .from(cloud)
      .where(eq(cloud.chatId, chatId))
      .limit(1);

    if (!cloudRecord || cloudRecord.length === 0) {
      return NextResponse.json({
        success: false,
        data: null,
      });
    }

    // 解密敏感字段
    const decryptedRecord = await decryptCloudRecord(cloudRecord[0]);

    return NextResponse.json({
      success: true,
      data: decryptedRecord,
    });
  } catch (error: any) {
    console.error('Error checking cloud status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check cloud status' },
      { status: 500 }
    );
  }
}

