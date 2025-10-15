import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSupabaseProjectApiKeys } from '@/supabase';

import { getSystemPrompt } from '@/agent/idea-to-code/nodes/prompts';

// 获取项目的 API Keys
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

    // 从 URL 参数获取信息
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const accessToken = searchParams.get('accessToken') || undefined;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    console.log(`API route: Getting API keys for project ${projectId}`);
    
    const result = await getSupabaseProjectApiKeys(projectId, accessToken);

    const supabase = {
      projectId: projectId,
      publishableKey: result.data?.publishableKey,
      url: result.data?.url,
      hasSelectedProject: true,
    };

    const systemPrompt = getSystemPrompt('', supabase);
    
    console.log('API route result:', result);

    if (!result.success) {
      console.error('API route error:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log('API route success, returning data:', result.data);
    return NextResponse.json({
      success: true,
      data: result.data,
      systemPrompt: systemPrompt,
    });
  } catch (error: any) {
    console.error('Error in get Supabase API keys:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get API keys' },
      { status: 500 }
    );
  }
}

