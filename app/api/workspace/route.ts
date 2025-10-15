import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getUserWorkspaces } from '@/utils/workspace';
import { db } from '@/db';
import { workspaces, memberInWorkspace, credits } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Utility function to create a new workspace for user
const createWorkspaceForUser = async (userId: string, userName: string | null, userEmail: string | null | undefined) => {
  const workspaceId = crypto.randomUUID();
  
  // Determine default plan based on email
  const parseWorkspaceDefaultPlan = (email: string | null | undefined): 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE' => {
    if (!email) return 'FREE';
    const adminEmails = process.env.ADMIN_EMAIL?.split(",") || [];
    if (adminEmails.includes(email)) {
      return 'PRO';
    }
    return 'FREE';
  };

  const newWorkspaceData = {
    id: workspaceId,
    name: userName ? `${userName}'s workspace` : "My workspace",
    plan: parseWorkspaceDefaultPlan(userEmail),
    oneApiToken: "",
    tokenId: null,
  };

  // Create workspace
  // Create workspace
  await db.insert(workspaces).values(newWorkspaceData);
  
  // Add user as admin to the workspace
  await db.insert(memberInWorkspace).values({
    userId: userId,
    workspaceId: workspaceId,
    role: 'ADMIN'
  });

  // Initialize credits for the workspace
  await db.insert(credits).values({
    workspaceId: workspaceId,
    totalCredits: 5, // Default credits for new workspaces
    usedCredits: 0,
  });

  return workspaceId;
};

export async function GET(request: Request) {
  // 获取当前用户session
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 获取当前用户的所有workspaces
  try {
    let workspaces = await getUserWorkspaces(session.user.id);
    
    // 如果用户没有workspace，自动创建一个
    if (workspaces.length === 0) {
      const workspaceId = await createWorkspaceForUser(
        session.user.id, 
        session.user.name ?? null, 
        session.user.email ?? null
      );
      
      // 重新获取workspaces（包含新创建的）
      workspaces = await getUserWorkspaces(session.user.id);
    }
    
    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error('Get workspaces error:', error);
    return NextResponse.json({ error: 'Failed to get workspaces' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  // Get current user session
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { workspaceId, name, description, icon } = await request.json();
    
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID is required' }, { status: 400 });
    }

    // Verify user has access to this workspace
    const userWorkspaces = await getUserWorkspaces(session.user.id);
    const hasAccess = userWorkspaces.some(workspace => workspace.id === workspaceId);
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update workspace
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    updateData.updatedAt = new Date();

    await db
      .update(workspaces)
      .set(updateData)
      .where(eq(workspaces.id, workspaceId));

    return NextResponse.json({ success: true, message: 'Workspace updated successfully' });
  } catch (error) {
    console.error('Update workspace error:', error);
    return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 });
  }
}
