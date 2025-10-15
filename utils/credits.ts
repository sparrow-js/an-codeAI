import { withDb } from '@/db/edge-db';
import { credits } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

/**
 * 检查指定工作空间是否有足够的可用积分
 * @param workspaceId 工作空间ID
 * @param requiredCredits 需要的积分数量，默认为1
 * @returns Promise<boolean> 是否有足够的积分
 */
export async function checkCredits(workspaceId: string, requiredCredits: number = 1): Promise<boolean> {
  try {
    const result = await withDb(db => 
      db.select({
        available: sql<number>`total_credits - used_credits`
      })
      .from(credits)
      .where(eq(credits.workspaceId, workspaceId))
    );

    if (!result.length) {
      return false;
    }

    return result[0].available >= requiredCredits;
  } catch (error) {
    console.error('Error checking credits:', error);
    return false;
  }
}

/**
 * 消耗指定数量的积分
 * @param workspaceId 工作空间ID
 * @param creditsToConsume 要消耗的积分数量，默认为1
 * @returns Promise<boolean> 是否成功消耗积分
 */
export async function consumeCredits(workspaceId: string, creditsToConsume: number = 1): Promise<boolean> {
  try {
    const result = await withDb(db => 
      db.update(credits)
        .set({
          usedCredits: sql`used_credits + ${creditsToConsume}`
        })
        .where(
          and(
            eq(credits.workspaceId, workspaceId),
            sql`total_credits >= used_credits + ${creditsToConsume}`
          )
        )
        .returning({
          updated: sql`1`
        })
    );

    return result.length > 0;
  } catch (error) {
    console.error('Error consuming credits:', error);
    return false;
  }
}

/**
 * 获取工作空间的积分信息
 * @param workspaceId 工作空间ID
 * @returns Promise<{totalCredits: number, usedCredits: number, availableCredits: number} | null>
 */
export async function getCreditInfo(workspaceId: string): Promise<{
  totalCredits: number;
  usedCredits: number;
  availableCredits: number;
} | null> {
  try {
    const result = await withDb(db =>
      db.select({
        totalCredits: credits.totalCredits,
        usedCredits: credits.usedCredits,
        availableCredits: sql<number>`total_credits - used_credits`
      })
      .from(credits)
      .where(eq(credits.workspaceId, workspaceId))
    );

    if (!result.length) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('Error getting credit info:', error);
    return null;
  }
} 