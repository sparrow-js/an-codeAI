import { NextRequest, NextResponse } from 'next/server';
import { createMachine } from '@/utils/machines';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appId, machineName } = body;

    if (!appId || !machineName) {
      return NextResponse.json({ success: false, error: '缺少 appId 或 machineName' }, { status: 400 });
    }

    const machineData = await createMachine(appId, machineName);

    return NextResponse.json({ success: true, data: machineData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || '创建机器失败' }, { status: 500 });
  }
}
