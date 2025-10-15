import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { listSupabaseProjects, getSupabaseProject, deleteSupabaseProject } from '@/supabase';

// 获取项目列表或单个项目详情
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
    const organizationId = searchParams.get('organizationId');
    const accessToken = searchParams.get('accessToken') || undefined;

    // 如果提供了 projectId，获取单个项目详情
    if (projectId) {
      const result = await getSupabaseProject(projectId, accessToken);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.data,
      });
    }

    // 否则获取项目列表
    const result = await listSupabaseProjects(organizationId || undefined, accessToken);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      count: result.data?.length || 0,
    });
  } catch (error: any) {
    console.error('Error in get Supabase projects API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get Supabase projects' },
      { status: 500 }
    );
  }
}

// 删除项目
export async function DELETE(request: Request) {
  try {
    // 验证用户身份
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 从请求体获取信息
    const body = await request.json();
    const { projectId, accessToken } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const result = await deleteSupabaseProject(projectId, accessToken);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error in delete Supabase project API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete Supabase project' },
      { status: 500 }
    );
  }
}

