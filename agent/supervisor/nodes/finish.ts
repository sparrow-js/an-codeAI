import { END } from "@langchain/langgraph";
import { SupervisorState, SupervisorUpdate } from "../types";
import { withDb } from "@/db/edge-db";
import { chats } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * The finish node for the supervisor graph.
 * This node marks the end of the workflow and updates the chat messages in the database.
 */
export async function finish(state: SupervisorState): Promise<Partial<SupervisorUpdate>> {
  // Update the chat messages in the database
  if (state.appId && state.originalMessages && state.originalMessages.length > 0) {
    try {
      // Extract the chat ID from appId (remove 'app-' prefix if present)
      const chatId = state.appId.replace('app-', '');
      
      await withDb(async (db) => {
        const result = await db.update(chats)
          .set({ 
            messages: state.originalMessages,
            updatedAt: new Date()
          })
          .where(eq(chats.id, chatId))
          .returning();
          
        if (result.length > 0) {
          console.log('Successfully updated chat messages for chatId:', chatId);
        } else {
          console.warn('No chat found with ID:', chatId);
        }
      });
    } catch (error) {
      throw error;
    }
  } else {
    console.warn('Missing appId or originalMessages, skipping database update');
  }
  
  return state;
}