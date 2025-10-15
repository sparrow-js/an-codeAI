import { NextRequest, NextResponse } from 'next/server';
import { redeployMachineById } from '@/utils/machinesManager';

/**
 * 重新部署接口
 * POST /api/apps/redeploy
 * body: { chatId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chatId } = body;

    if (!chatId) {
      return NextResponse.json(
        { success: false, message: 'chatId is required' },
        { status: 400 }
      );
    }


    // 调用重新部署逻辑
    const result = await redeployMachineById(chatId, `https://github.com/wordixai/repo-${chatId}.git`);

    if (result?.success) {
      return NextResponse.json({ success: true, machine: result.machine });
    } else {
      return NextResponse.json(
        { success: false, message: result?.error || 'Redeploy failed' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
