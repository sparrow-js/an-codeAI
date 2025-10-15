import { NextResponse } from 'next/server';
import { db } from '@/db'; // 假设有db实例
import { machines } from '@/db/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId } = body;

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'chatId is required' },
        { status: 400 }
      );
    }

    // 创建机器记录
    const [machine] = await db
      .insert(machines)
      .values({
        chatId,
        state: 'created',
        // 其他字段使用默认值
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: machine,
    });
  } catch (error: any) {
    console.error('Error creating machine:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create machine' },
      { status: 500 }
    );
  }
}
