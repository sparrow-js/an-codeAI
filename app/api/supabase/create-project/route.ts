import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createSupabaseProject, generateRandomPassword } from '@/supabase';
import { getSupabaseProjectApiKeys } from '@/supabase';
import { db } from '@/db';
import { cloud } from '@/db/schema';
import { encryptCloudRecord } from '@/lib/db-encryption';
import { updateSupabaseProjectSiteUrl } from '@/supabase';

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
    const { name, plan, workspaceId, chatId } = body;

    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
    const dbPassword = generateRandomPassword();
    const organizationId = 'drgvwtgbercfntpfzdge';
    const region = 'ap-southeast-1';

    // 验证必需参数
    if (!name) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Workspace ID is required' },
        { status: 400 }
      );
    }

    // 调用 Supabase API 创建项目
    const result = await createSupabaseProject(
      {
        name,
        organizationId,
        region,
        plan,
        dbPassword,
      },
      accessToken
    );

    console.log('result *********', result);

    const projectId = result.data?.id || '';

    const keys = await getSupabaseProjectApiKeys(projectId, accessToken);

    console.log('keys *********', keys);

    // 插入数据到 cloud 表
    if (keys.success && keys.data) {
      // 加密敏感字段
      const encryptedData = await encryptCloudRecord({
        cloudId: result.data?.id || '',
        chatId: chatId,
        projectId: keys.data.projectId,
        publishableKey: keys.data.publishableKey,
        supabaseUrl: keys.data.url,
        workspaceId: workspaceId,
        dbPassword: dbPassword,
      });
      
      await db.insert(cloud).values(encryptedData);
    }

    await updateSupabaseProjectSiteUrl(projectId, `https://preview--${chatId}.pages.dev/`, accessToken);

    if (!result.success) {
      return NextResponse.json(
        { 
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
  } catch (error: any) {
    console.error('Error in create Supabase project API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Supabase project' },
      { status: 500 }
    );
  }
}

