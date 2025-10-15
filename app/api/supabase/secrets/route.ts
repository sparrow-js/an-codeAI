import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { cloud } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Secret {
  name: string;
  value: string;
}

// GET - List all secrets for a project
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'chatId is required' },
        { status: 400 }
      );
    }

    // Get project info from database
    const cloudRecord = await db
      .select()
      .from(cloud)
      .where(eq(cloud.chatId, chatId))
      .limit(1);

    if (!cloudRecord || cloudRecord.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found for this chat' },
        { status: 404 }
      );
    }

    const { projectId } = cloudRecord[0];

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID not found' },
        { status: 404 }
      );
    }

    // Get secrets from Supabase Management API
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Supabase access token not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectId}/secrets`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get secrets:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to get secrets' },
        { status: response.status }
      );
    }

    const secrets = await response.json();
    
    // Return only secret names (not values for security)
    const secretList = secrets.map((s: any) => ({
      name: s.name,
      createdAt: s.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: secretList,
    });
  } catch (error) {
    console.error('Error getting secrets:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get secrets',
      },
      { status: 500 }
    );
  }
}

// POST - Create or update secrets
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { chatId, secrets } = body as { chatId: string; secrets: Secret[] };

    if (!chatId || !secrets || !Array.isArray(secrets)) {
      return NextResponse.json(
        { success: false, error: 'chatId and secrets array are required' },
        { status: 400 }
      );
    }

    // Get project info from database
    const cloudRecord = await db
      .select()
      .from(cloud)
      .where(eq(cloud.chatId, chatId))
      .limit(1);

    if (!cloudRecord || cloudRecord.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found for this chat' },
        { status: 404 }
      );
    }

    const { projectId } = cloudRecord[0];

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID not found' },
        { status: 404 }
      );
    }

    // Set secrets using Supabase Management API
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Supabase access token not configured' },
        { status: 500 }
      );
    }

    // Create secrets payload
    const secretsPayload = secrets.map(s => ({
      name: s.name,
      value: s.value,
    }));

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectId}/secrets`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(secretsPayload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create secrets:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to create secrets' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Secrets saved successfully',
    });
  } catch (error) {
    console.error('Error creating secrets:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create secrets',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a secret
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { chatId, secretName } = body as { chatId: string; secretName: string };

    if (!chatId || !secretName) {
      return NextResponse.json(
        { success: false, error: 'chatId and secretName are required' },
        { status: 400 }
      );
    }

    // Get project info from database
    const cloudRecord = await db
      .select()
      .from(cloud)
      .where(eq(cloud.chatId, chatId))
      .limit(1);

    if (!cloudRecord || cloudRecord.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project not found for this chat' },
        { status: 404 }
      );
    }

    const { projectId } = cloudRecord[0];

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID not found' },
        { status: 404 }
      );
    }

    // Delete secret using Supabase Management API
    const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Supabase access token not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectId}/secrets`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([secretName]),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to delete secret:', errorText);
      return NextResponse.json(
        { success: false, error: 'Failed to delete secret' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Secret deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting secret:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete secret',
      },
      { status: 500 }
    );
  }
}

