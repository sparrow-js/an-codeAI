import { NextResponse } from "next/server";
import { withDb } from '@/db/edge-db';
import { deploy } from '@/db/schema';
import { auth } from "@/auth";

export async function GET(
    request: Request, 
    { params }: { params: Promise<{ appId: string }> } // 类型定义
) {
  const { appId } = await params; // 从 params 中获取 id
  try {

    if (!appId) {
      return NextResponse.json(
        { error: 'App ID is required' },
        { status: 400 }
      );
    }

    // Get user session
    const session = await auth();
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Find deploy record in database where chatId equals appId
    const deployRecord = await withDb(db => 
      db.query.deploy.findFirst({
        where: (deploy, { eq }) => eq(deploy.chatId, appId)
      })
    );

    const chat = await withDb(db => 
      db.query.chats.findFirst({
        where: (chats, { eq }) => eq(chats.id, appId)
      })
    );


    if (!deployRecord) {
      return NextResponse.json(
        { status: 'no' },
      );
    }

    return NextResponse.json({
      siteName: deployRecord.siteName,
      siteId: deployRecord.siteId,
      status: deployRecord.hostingStatus,
      url: chat?.shortId,
      createdAt: deployRecord.createdAt,
      updatedAt: deployRecord.updatedAt
    });
  } catch (error) {
    console.error('Error fetching deploy info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deploy information' },
      { status: 500 }
    );
  }
}
