import { NextRequest, NextResponse } from 'next/server';
import { checkCloudflareDeploymentStatus } from '@/utils/cloudflare';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get('project_name');

    if (!projectName) {
      return NextResponse.json(
        { error: 'project_name parameter is required' },
        { status: 400 }
      );
    }

    const result = await checkCloudflareDeploymentStatus(projectName);

    // 检查是否返回错误
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode }
      );
    }

    // 返回成功结果
    return NextResponse.json(result);

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
