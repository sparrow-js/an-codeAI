import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { cloud } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { decryptCloudRecord } from '@/lib/db-encryption';

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

    // 从 URL 参数获取 chatId 和 bucketName
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const bucketName = searchParams.get('bucketName');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    if (!bucketName) {
      return NextResponse.json(
        { error: 'Bucket name is required' },
        { status: 400 }
      );
    }

    // 查询 cloud 表获取项目信息
    const cloudRecord = await db
      .select()
      .from(cloud)
      .where(eq(cloud.chatId, chatId))
      .limit(1);

    if (!cloudRecord || cloudRecord.length === 0) {
      return NextResponse.json(
        { error: 'Project not found for this chat' },
        { status: 404 }
      );
    }

    // 解密敏感字段
    const decryptedRecord = await decryptCloudRecord(cloudRecord[0]);
    const { dbPassword, projectId } = decryptedRecord;

    if (!projectId || !dbPassword) {
      return NextResponse.json(
        { error: 'Project credentials not found' },
        { status: 404 }
      );
    }

    // 使用 SQL 查询获取文件列表
    const { executeSupabaseSQLWithPostgres } = await import('@/supabase');
    
    const query = `
      SELECT 
        name,
        id,
        bucket_id,
        metadata,
        created_at,
        updated_at
      FROM storage.objects
      WHERE bucket_id = '${bucketName}'
      ORDER BY created_at DESC;
    `;

    const result = await executeSupabaseSQLWithPostgres(
      projectId,
      dbPassword,
      query
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch bucket files' },
        { status: 500 }
      );
    }

    // Transform the data
    const files = (result.data || []).map((row: any) => {
      const metadata = row.metadata || {};
      const size = metadata.size || 0;
      const mimeType = metadata.mimetype || '';
      
      // Determine if it's a folder (ends with /)
      const isFolder = row.name.endsWith('/');
      
      return {
        name: row.name,
        id: row.id,
        size,
        type: mimeType,
        lastModified: row.updated_at || row.created_at,
        createdAt: row.created_at,
        isFolder,
      };
    });

    return NextResponse.json({
      success: true,
      data: files,
    });
  } catch (error: any) {
    console.error('Error fetching bucket files:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch bucket files' },
      { status: 500 }
    );
  }
}

