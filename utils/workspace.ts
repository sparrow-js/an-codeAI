import { withDb } from '../db/edge-db';
import { workspaces, memberInWorkspace } from '../db/schema';
import { eq } from 'drizzle-orm';

export interface UserWorkspace {
  id: string;
  name: string;
  plan: string;
  icon: string | null;
  role: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 获取用户的第一个workspace（通常是默认workspace）
 * @param userId 用户ID
 * @returns 用户的workspace信息
 */
export async function getUserWorkspace(userId: string): Promise<UserWorkspace | null> {
  try {
    const result = await withDb(db => db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        plan: workspaces.plan,
        icon: workspaces.icon,
        role: memberInWorkspace.role,
        description: workspaces.description,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
      })
      .from(memberInWorkspace)
      .innerJoin(workspaces, eq(memberInWorkspace.workspaceId, workspaces.id))
      .where(eq(memberInWorkspace.userId, userId))
      .limit(1)
    );

    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Error fetching user workspace:', error);
    throw new Error('Failed to fetch user workspace');
  }
}

/**
 * 获取用户的所有workspaces
 * @param userId 用户ID  
 * @returns 用户的所有workspace信息
 */
export async function getUserWorkspaces(userId: string): Promise<UserWorkspace[]> {
  try {
    const result = await withDb(db => db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        plan: workspaces.plan,
        icon: workspaces.icon,
        role: memberInWorkspace.role,
        description: workspaces.description,
        createdAt: workspaces.createdAt,
        updatedAt: workspaces.updatedAt,
      })
      .from(memberInWorkspace)
      .innerJoin(workspaces, eq(memberInWorkspace.workspaceId, workspaces.id))
      .where(eq(memberInWorkspace.userId, userId))
    );

    return result;
  } catch (error) {
    console.error('Error fetching user workspaces:', error);
    throw new Error('Failed to fetch user workspaces');
  }
} 