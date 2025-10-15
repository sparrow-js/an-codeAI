import { db } from '@/db';
import { machines, deploy } from '@/db/schema';
import { desc, count, eq, and, ne } from 'drizzle-orm';
import { deleteMachineAndUpdateDeploy } from '@/lib/db-operations/machines';
import { deleteFlyApp } from './machines';
import { broadcast } from './broadcast';
import { redeploy } from '@/lib/deploy';
/**
 * 机器数量限制常量
 */
const MAX_MACHINES_LIMIT = 25;

/**
 * 检查机器数量并在超过限制时删除最旧的机器
 * @param workspaceId 工作空间ID（可选）
 * @param userId 用户ID（可选）
 * @returns 检查和清理结果
 */
  export async function checkAndCleanupMachines() {
  try {
    // 构建查询条件
    let whereConditions: any[] = [];
    
    // 如果没有指定条件，则检查所有机器
    const whereClause = whereConditions.length > 0 ? whereConditions : undefined;

    // 获取当前机器总数（排除已删除的机器）
    const [machineCount] = await db
      .select({ count: count() })
      .from(machines)
      .where(whereClause ? and(whereConditions[0], ne(machines.state, 'destroyed')) : ne(machines.state, 'destroyed'));

    console.log(`当前机器数量: ${machineCount.count}, 限制: ${MAX_MACHINES_LIMIT}`);

    // 如果机器数量未超过限制，直接返回
    if (machineCount.count <= MAX_MACHINES_LIMIT) {
      return {
        success: true,
        message: `机器数量 ${machineCount.count} 未超过限制 ${MAX_MACHINES_LIMIT}`,
        currentCount: machineCount.count,
        deletedCount: 0,
        deletedMachines: []
      };
    }

    console.log(`机器数量超过限制，需要删除最旧的一个机器`);

    // 获取最旧的一个机器（按创建时间排序，排除已删除的机器）
    const oldestMachines = await db
      .select({
        id: machines.id,
        chatId: machines.chatId,
        state: machines.state,
        url: machines.url,
        createdAt: machines.createdAt
      })
      .from(machines)
      .where(whereClause ? and(whereConditions[0], ne(machines.state, 'destroyed')) : ne(machines.state, 'destroyed'))
      .orderBy(machines.createdAt) // 最旧的在前
      .limit(1); // 只获取一个最旧的机器

    if (oldestMachines.length === 0) {
      return {
        success: true,
        message: '没有找到需要删除的机器',
        currentCount: machineCount.count,
        deletedCount: 0,
        deletedMachines: []
      };
    }

    const machine = oldestMachines[0];
    console.log(`找到最旧的机器待删除: ${machine.id}, 创建时间: ${machine.createdAt}`);

    // 删除机器的结果记录
    let deletionResult: any;
    let success = false;

    // 删除最旧的机器
    try {
      // 删除数据库中的机器记录并更新相关部署状态
      const dbResult = await deleteMachineAndUpdateDeploy(machine.chatId || '');

      
      if (dbResult.success) {
        try {
          await deleteFlyApp(`${machine.chatId}`);

        } catch (error) {
          console.error('删除机器失败：', error);
        }

        success = true;
        deletionResult = {
          machineId: machine.chatId,
          success: true,
          createdAt: machine.createdAt,
          url: machine.url
        };
      } else {
        deletionResult = {
          machineId: machine.id,
          success: false,
          error: 'error' in dbResult ? dbResult.error : 'Unknown database error',
          createdAt: machine.createdAt,
          url: machine.url
        };
        console.error(`删除机器失败: ${machine.id}, 错误: ${'error' in dbResult ? dbResult.error : 'Unknown database error'}`);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      deletionResult = {
        machineId: machine.id,
        success: false,
        error: errorMessage,
        createdAt: machine.createdAt,
        url: machine.url
      };
      console.error(`删除机器 ${machine.id} 时发生错误:`, error);
    }


    return {
      success: success,
      message: success ? `机器清理完成。成功删除最旧的机器` : `机器删除失败`,
      initialCount: machineCount.count,
      deletedCount: success ? 1 : 0,
      errorCount: success ? 0 : 1,
      deletedMachines: deletionResult ? [deletionResult] : []
    };

  } catch (error) {
    console.error('检查和清理机器时发生错误:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      currentCount: 0,
      deletedCount: 0,
      deletedMachines: []
    };
  }
}


/**
 * 重新部署机器 - 根据机器ID
 * @param machineId 机器ID
 * @param options 重新部署选项
 * @returns 重新部署结果
 */
export async function redeployMachineById(
  chatId: string, 
  sourceRepoUrl: string,
) {
  try {
    // 更新现有机器状态为 'starting'
    const result = await db
      .update(machines)
      .set({
        state: 'starting',
        url: null,
        updatedAt: new Date()
      })
      .where(eq(machines.chatId, chatId))
      .returning();

    // 如果没有找到要更新的机器，返回错误
    if (result.length === 0) {
      return {
        success: false,
        error: 'No machine found for the given chatId'
      };
    }

    await redeploy(sourceRepoUrl, chatId);

    broadcast(chatId, 'redeploy', { 
        chatId: chatId,
        status: 'redeploying'
    });

    return {
      success: true,
      machine: result[0]
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * 根据 chatId 获取机器信息
 * @param chatId 聊天ID
 * @returns 机器信息，如果不存在则返回 null
 */
export async function getMachineByChatId(chatId: string) {
  try {
    const result = await db
      .select()
      .from(machines)
      .where(and(
        eq(machines.chatId, chatId),
      ))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('获取机器信息时发生错误:', error);
    throw error;
  }
}

/**
 * 检查指定 chatId 是否存在于 machines 表中
 * @param chatId 聊天ID
 * @returns 是否存在对应记录
 */
export async function hasMachineByChatId(chatId: string): Promise<boolean> {
  try {
    const machine = await getMachineByChatId(chatId);
    return machine !== null && machine.state !== 'destroyed';
  } catch (error) {
    console.error('检测 chatId 是否存在时发生错误:', error);
    throw error;
  }
}

export async function getMachineStatus(chatId: string):Promise<any> {
  try {
    const machine = await getMachineByChatId(chatId);
    if (machine === null) {
      return null;
    }
    return machine.state;
  } catch (error) {
    console.error('获取机器状态时发生错误:', error);
    throw error;
  }
}


export async function createMachine (chatId: string) {
  // 创建机器记录
  const [machine] = await db
  .insert(machines)
  .values({
    chatId,
    state: 'created',
    // 其他字段使用默认值
  })
  .returning();
  
  return machine;
}


