import { NextRequest, NextResponse } from 'next/server';
import { deleteFlyApp } from '@/utils/machines';
import { deleteMachineAndUpdateDeploy } from '@/lib/db-operations/machines';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chatId } = body;

    if (!chatId) {
      return NextResponse.json({ success: false, error: '缺少 appName' }, { status: 400 });
    }

    const result = await deleteMachineAndUpdateDeploy(chatId);

    await deleteFlyApp(`${chatId}`);

    return NextResponse.json({ success: true, message: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || '删除失败' }, { status: 500 });
  }
}
