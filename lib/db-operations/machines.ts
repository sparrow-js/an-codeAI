
import { db } from '@/db';
import { machines, deploy } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';

/**
 * 删除机器记录并更新相关的deploy记录状态
 * @param machineId 要删除的机器ID
 * @returns 删除操作的结果
 */
export async function deleteMachineAndUpdateDeploy(chatId: string) {
  try {
    // 开始事务
    return await db.transaction(async (tx) => {
      // 首先查找要删除的机器记录（排除已删除的机器）
      const machineToDelete = await tx
        .select({
          id: machines.id,
          chatId: machines.chatId,
        })
        .from(machines)
        .where(and(
          eq(machines.chatId, chatId),
          ne(machines.state, 'destroyed')
        ))
        .limit(1);

      if (machineToDelete.length === 0) {
        throw new Error(`Machine with ID ${chatId} not found`);
      }

      const machine = machineToDelete[0];

      // 如果机器关联了deploy记录，更新deploy的machineStatus为'deleted'
      if (machine.chatId) {
        await tx
          .update(deploy)
          .set({ 
            machineStatus: 'deleted',
            updatedAt: new Date()
          })
          .where(eq(deploy.chatId, machine.chatId));
      }

      // 更新机器状态为destroyed（只更新未删除的机器）
      const updatedMachine = await tx
        .update(machines)
        .set({ 
          state: 'destroyed',
          updatedAt: new Date()
        })
        .where(and(
          eq(machines.chatId, chatId),
          ne(machines.state, 'destroyed')
        ))
        .returning();

      return {
        success: true,
        deletedMachine: updatedMachine[0],
        updatedDeployId: machine.chatId,
      };
    });
  } catch (error) {
    console.error('Error deleting machine and updating deploy:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      deletedMachine: null,
      updatedDeployId: null
    };
  }
}
/**
 * 根据deployId删除关联的机器并更新deploy状态
 * @param deployId 部署记录ID
 * @returns 删除操作的结果
 */
export async function deleteMachinesByDeployId(deployId: string) {
  try {
    return await db.transaction(async (tx) => {
      // 查找该deploy关联的所有机器（排除已删除的机器）
      const associatedMachines = await tx
        .select({
          id: machines.id,
        })
        .from(machines)
        .where(and(
          eq(machines.chatId, deployId),
          ne(machines.state, 'destroyed')
        ));

      if (associatedMachines.length === 0) {
        return {
          success: true,
          message: `No machines found for deploy ID ${deployId}`,
          deletedCount: 0
        };
      }

      // 更新所有关联的机器状态为destroyed（只更新未删除的机器）
      const updatedMachines = await tx
        .update(machines)
        .set({ 
          state: 'destroyed',
          updatedAt: new Date()
        })
        .where(and(
          eq(machines.chatId, deployId),
          ne(machines.state, 'destroyed')
        ))
        .returning();

      // 更新deploy的machineStatus为'deleted'
      await tx
        .update(deploy)
        .set({ 
          machineStatus: 'deleted',
          updatedAt: new Date()
        })
        .where(eq(deploy.id, deployId));

      return {
        success: true,
        deletedMachines: updatedMachines,
        deletedCount: updatedMachines.length,
        message: `Updated ${updatedMachines.length} machines to destroyed for deploy ${deployId}`
      };
    });
  } catch (error) {
    console.error('Error deleting machines by deploy ID:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      deletedMachines: [],
      deletedCount: 0
    };
  }
}


export async function getAllMachines() {
  const allMachines = await db.select().from(machines);
  return allMachines;
}