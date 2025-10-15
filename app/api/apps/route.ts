import { NextResponse } from 'next/server';
import { getAllApps } from '@/utils/machines';
import { getAllMachines } from '@/lib/db-operations/machines';

export async function GET(request: Request) {
  try {
    const result = await getAllApps();

    const allMachines = await getAllMachines();
    
    
    // 处理Fly.io API的响应格式
    const apps = result.apps || result || [];
    const totalApps = result.total_apps || apps.length;
    
    return NextResponse.json({
      success: true,
      data: apps,
      machines: allMachines,
      count: apps.length,
      totalApps: totalApps
    });
  } catch (error: any) {
    console.error('Error fetching apps:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch apps'
      },
      { status: 500 }
    );
  }
}
