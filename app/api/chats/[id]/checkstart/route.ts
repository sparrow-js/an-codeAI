import { NextResponse } from 'next/server';
import { auth } from 'auth';
import { hasMachineByChatId, redeployMachineById, getMachineByChatId } from '@/utils/machinesManager';
import { broadcast } from '@/utils/broadcast';


export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 验证用户身份
    const session = await auth();
    if (!session?.user?.id) {
      return new Response('Unauthorized', {
        status: 401,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    if (!id) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }


    // 检查机器是否存在
    const hasMachine = await hasMachineByChatId(id);

    if (!hasMachine) {
      // 机器不存在，需要启动
      console.log('Machine not found, starting deployment for chatId:', id);
      
      // 启动机器部署
      const redeployResult = await redeployMachineById(
        id, 
        `https://github.com/wordixai/repo-${id}.git`
      );

      if (redeployResult.success) {
        return NextResponse.json({
          status: 'starting',
          message: 'Machine deployment started',
          machine: redeployResult.machine
        });
      } else {
        return NextResponse.json({
          status: 'error',
          message: 'Failed to start machine deployment',
          error: redeployResult.error
        }, { status: 500 });
      }
    } else {
      // 机器已存在，获取机器信息
      const machine = await getMachineByChatId(id);

      await broadcast(id, 'message', { 
        chatId: id,
        status: 'created',
        type: 'redeploy',
        message: 'Machine deployment started',
      });
      return NextResponse.json({
        status: 'exists',
        message: 'Machine already exists',
        machine: machine
      });
    }

  } catch (error) {
    console.error('Failed to check/start machine:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}