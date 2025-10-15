/**
 * Webhook API Route
 * 
 * Handles incoming webhooks from Creem's payment system.
 * Processes both one-time payments and subscription lifecycle events.
 * Updates local database to maintain payment and subscription state.
 * 
 * @module api/webhook
 */

import { NextResponse, NextRequest } from "next/server";
import { db } from '@/db';
import { subscription, oneTimePurchase, credits, workspaces } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Webhook Response Interface
 * 
 * Represents the structure of incoming webhook events from Creem.
 * This is a simplified version focusing on essential fields for the template.
 * 
 * @interface WebhookResponse
 * @property {string} id - Unique identifier for the webhook event
 * @property {string} eventType - Type of event (e.g., "checkout.completed", "subscription.paid")
 * @property {Object} object - Contains the event payload
 * @property {string} object.request_id - Contains userId for one-time payments
 * @property {string} object.id - Unique identifier for the payment/subscription
 * @property {Object} object.customer - Customer information
 * @property {Object} object.product - Product information including billing type
 * @property {string} object.status - Current status of the payment/subscription
 * @property {Object} object.metadata - Additional data passed during checkout
 */
export interface WebhookResponse {
  id: string;
  eventType: string;
  object: {
    request_id: string;
    object: string;
    id: string;
    customer: {
      id: string;
    };
    product: {
      id: string;
      billing_type: string;
    };
    status: string;
    metadata: any;
  };
}

/**
 * Update Workspace Plan Function
 * 
 * Updates workspace plan based on current plan and payment type:
 * - FREE → ONETIME (after one-time purchase)
 * - ONETIME → PRO (after subscription)
 * - PRO → PRO (stays PRO)
 * 
 * @async
 * @function
 * @param {string} workspaceId - The workspace ID to update plan for
 * @param {boolean} isSubscription - Whether this is a subscription payment
 * @returns {Promise<void>}
 */
async function updateWorkspacePlan(workspaceId: string, isSubscription: boolean): Promise<void> {
  try {
    // Get current workspace plan
    const workspace = await db
      .select({ plan: workspaces.plan })
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (workspace.length === 0) {
      console.error(`Workspace not found: ${workspaceId}`);
      return;
    }

    const currentPlan = workspace[0].plan;
    let newPlan: string | null = null;

    if (isSubscription) {
      // Subscription payment: ONETIME or FREE → PRO, PRO stays PRO
      if (currentPlan === 'FREE' || currentPlan === 'ONETIME') {
        newPlan = 'PRO';
      }
      // PRO stays PRO (no change needed)
    } else {
      // One-time payment: FREE → ONETIME, others stay the same
      if (currentPlan === 'FREE') {
        newPlan = 'ONETIME';
      }
      // ONETIME and PRO stay the same (no change needed)
    }

    // Update plan if needed
    if (newPlan && newPlan !== currentPlan) {
      await db
        .update(workspaces)
        .set({ 
          plan: newPlan as 'FREE' | 'ONETIME' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE',
          updatedAt: new Date()
        })
        .where(eq(workspaces.id, workspaceId));

      console.log(`Updated workspace ${workspaceId} plan: ${currentPlan} → ${newPlan}`);
    } else {
      console.log(`Workspace ${workspaceId} plan remains: ${currentPlan}`);
    }
  } catch (error) {
    console.error(`Failed to update workspace plan for ${workspaceId}:`, error);
    throw error;
  }
}

/**
 * Add Credits Function
 * 
 * Adds credits for one-time purchases with the following logic:
 * 1. Simply add creditAmount to existing totalCredits
 * 2. Keep usedCredits unchanged
 * 3. Update workspace plan based on payment type
 * 
 * If no credits record exists, creates a new one with the specified amount.
 * 
 * @async
 * @function
 * @param {string} workspaceId - The workspace ID to add credits for
 * @param {number} creditAmount - The amount of credits to add to totalCredits
 * @returns {Promise<void>}
 * 
 * @example
 * // If workspace has 150 total, 30 used
 * // After adding: 200 total, 30 used
 * await addCredits("workspace_123", 50);
 */
async function addCredits(workspaceId: string, creditAmount: number): Promise<void> {
  try {
    // Check if credits record exists for this workspace
    const existingCredits = await db
      .select({
        totalCredits: credits.totalCredits,
        usedCredits: credits.usedCredits
      })
      .from(credits)
      .where(eq(credits.workspaceId, workspaceId))
      .limit(1);

    if (existingCredits.length > 0) {
      const currentRecord = existingCredits[0];
      const newTotalCredits = currentRecord.totalCredits + creditAmount;

      // Update existing credits record:
      // - Add creditAmount to totalCredits
      // - Keep usedCredits unchanged
      await db
        .update(credits)
        .set({
          totalCredits: newTotalCredits,
          updatedAt: new Date()
        })
        .where(eq(credits.workspaceId, workspaceId));

      console.log(`Successfully added credits for workspace ${workspaceId}: 
        Previous: ${currentRecord.totalCredits} total, ${currentRecord.usedCredits} used
        New: ${newTotalCredits} total, ${currentRecord.usedCredits} used`);
    } else {
      // Create new credits record for this workspace
      await db.insert(credits).values({
        workspaceId,
        totalCredits: creditAmount,
        usedCredits: 0,
      });

      console.log(`Created new credits record for workspace ${workspaceId} with ${creditAmount} credits`);
    }

    // Update workspace plan for one-time purchase
    await updateWorkspacePlan(workspaceId, false);
  } catch (error) {
    console.error(`Failed to add credits for workspace ${workspaceId}:`, error);
    throw error;
  }
}

/**
 * Recharge Credits Function
 * 
 * Recharges credits for subscription renewals with the following logic:
 * 1. Calculate remaining credits (totalCredits - usedCredits)
 * 2. Reset usedCredits to 0
 * 3. Set totalCredits to (remaining credits + creditAmount)
 * 4. Update workspace plan based on subscription payment
 * 
 * If no credits record exists, creates a new one with the specified amount.
 * 
 * @async
 * @function
 * @param {string} workspaceId - The workspace ID to recharge credits for
 * @param {number} creditAmount - The amount of credits to add to remaining credits
 * @returns {Promise<void>}
 * 
 * @example
 * // If workspace has 150 total, 30 used (120 remaining)
 * // After recharge: 120 + 100 = 220 total, 0 used
 * await rechargeCredits("workspace_123", 100);
 */
async function rechargeCredits(workspaceId: string, creditAmount: number): Promise<void> {
  try {
    // Check if credits record exists for this workspace
    const existingCredits = await db
      .select({
        totalCredits: credits.totalCredits,
        usedCredits: credits.usedCredits
      })
      .from(credits)
      .where(eq(credits.workspaceId, workspaceId))
      .limit(1);

    if (existingCredits.length > 0) {
      const currentRecord = existingCredits[0];
      const remainingCredits = currentRecord.totalCredits - currentRecord.usedCredits;
      const newTotalCredits = remainingCredits + creditAmount;

      // Update existing credits record:
      // - Reset usedCredits to 0
      // - Set totalCredits to remaining + creditAmount
      await db
        .update(credits)
        .set({
          totalCredits: newTotalCredits,
          usedCredits: 0,
          updatedAt: new Date()
        })
        .where(eq(credits.workspaceId, workspaceId));

      console.log(`Successfully recharged credits for workspace ${workspaceId}: 
        Previous: ${currentRecord.totalCredits} total, ${currentRecord.usedCredits} used (${remainingCredits} remaining)
        New: ${newTotalCredits} total, 0 used`);
    } else {
      // Create new credits record for this workspace
      await db.insert(credits).values({
        workspaceId,
        totalCredits: creditAmount,
        usedCredits: 0,
      });

      console.log(`Created new credits record for workspace ${workspaceId} with ${creditAmount} credits`);
    }

    // Update workspace plan for subscription payment
    await updateWorkspacePlan(workspaceId, true);
  } catch (error) {
    console.error(`Failed to recharge credits for workspace ${workspaceId}:`, error);
    throw error;
  }
}

/**
 * POST /api/webhook
 * 
 * Processes incoming webhook events from Creem's payment system.
 * Handles both one-time payments and subscription lifecycle events.
 * 
 * Event Types Handled:
 * 1. One-Time Payments:
 *    - checkout.completed: Payment successful, fulfill purchase
 *      * Special handling for product "prod_4cfaYqVCSxC6Nj1XzeJK5C": adds 50 credits to totalCredits (keeps usedCredits unchanged)
 * 
 * 2. Subscriptions:
 *    - subscription.paid: New subscription or successful renewal
 *      * Special handling for product "prod_7aY4nwFSq7Qpk7o9R6GUIN": resets used credits and adds 100 to remaining
 *    - subscription.canceled: Subscription cancellation requested
 *    - subscription.expired: Subscription ended (payment failed or period ended)
 * 
 * @async
 * @function
 * @param {NextRequest} req - Incoming webhook request containing event data
 * @returns {Promise<NextResponse>} Confirmation of webhook processing
 * 
 * @example Webhook Event - One-Time Payment
 * {
 *   "id": "whk_123",
 *   "eventType": "checkout.completed",
 *   "object": {
 *     "request_id": "user_123",
 *     "id": "pay_123",
 *     "customer": { "id": "cus_123" },
 *     "product": {
 *       "id": "prod_123",
 *       "billing_type": "one-time"
 *     }
 *   }
 * }
 * 
 * @example Webhook Event - Subscription
 * {
 *   "id": "whk_456",
 *   "eventType": "subscription.paid",
 *   "object": {
 *     "id": "sub_123",
 *     "metadata": { "userId": "user_123" },
 *     "customer": { "id": "cus_123" },
 *     "product": {
 *       "id": "prod_456",
 *       "billing_type": "recurring"
 *     }
 *   }
 * }
 */
export async function POST(req: NextRequest) {
  const webhook = (await req.json()) as WebhookResponse;

  // Determine payment type based on billing_type
  const isSubscription = webhook.object.product.billing_type === "recurring";

  if (!isSubscription) {
    /**
     * One-Time Payment Flow
     * --------------------
     * 1. Verify payment completion via checkout.completed event
     * 2. Extract user ID from request_id (set during checkout)
     * 3. Store purchase record in database
     * 4. Enable access to purchased product/feature
     * 5. For product "prod_rXXyuyj4nsFgOz2WYHn0i": add 50 credits to totalCredits (keeps usedCredits unchanged)
     */
    if (webhook.eventType === "checkout.completed") {
      const workspaceId = webhook.object.metadata.workspaceId; // Assuming request_id contains workspaceId
      const productId = webhook.object.product.id;
      const providerCustomerId = webhook.object.customer.id;
      
      // Create purchase record in database
      await db.insert(oneTimePurchase).values({
        id: webhook.object.id,
        workspaceId,
        product: productId,
        providerCustomerId,
        providerPaymentId: webhook.object.id,
        price: 0, // You may want to extract this from webhook data
        currency: 'USD',
        status: 'completed',
      });

      // Handle credit addition for specific product ID
      if (productId === "prod_rXXyuyj4nsFgOz2WYHn0i") {
        await addCredits(workspaceId, 50);
      }
    }
  } else {
    /**
     * Subscription Flow
     * ----------------
     * Handles the complete subscription lifecycle:
     * 
     * 1. subscription.paid
     *    - New subscription or successful renewal
     *    - Create/update subscription record
     *    - Enable access to subscription features
     *    - For product "prod_7aY4nwFSq7Qpk7o9R6GUIN": reset used credits to 0, add 100 to remaining credits
     * 
     * 2. subscription.canceled
     *    - User requested cancellation
     *    - Mark subscription for non-renewal
     *    - Optionally maintain access until period end
     * 
     * 3. subscription.expired
     *    - Final state: payment failed or canceled period ended
     *    - Update subscription status
     *    - Revoke access to subscription features
     */
    if (webhook.eventType === "subscription.paid") {
      const workspaceId = webhook.object.metadata.workspaceId || webhook.object.request_id;
      const productId = webhook.object.product.id;
      const providerCustomerId = webhook.object.customer.id;

      // Upsert subscription to handle both new and renewal payments
      const existingSubscription = await db
        .select()
        .from(subscription)
        .where(eq(subscription.id, webhook.object.id))
        .limit(1);

      if (existingSubscription.length > 0) {
        // Update existing subscription
        await db
          .update(subscription)
          .set({ 
            status: "active",
            updatedAt: new Date()
          })
          .where(eq(subscription.id, webhook.object.id));
      } else {
        // Create new subscription
        await db.insert(subscription).values({
          id: webhook.object.id,
          workspaceId,
          product: productId,
          status: "active",
          providerCustomerId,
          providerSubscriptionId: webhook.object.id,
          price: 0, // You may want to extract this from webhook data
          currency: 'USD',
        });
      }

      // Handle credit recharging for specific product ID
      if (productId === "prod_1cVdyjrJ0z53xnLDrqZfcO") {
        await rechargeCredits(workspaceId, 100);
      }
    }

    if (webhook.eventType === "subscription.canceled") {
      // Update subscription status to handle cancellation
      await db
        .update(subscription)
        .set({
          status: "canceled",
          updatedAt: new Date(),
        })
        .where(eq(subscription.id, webhook.object.id));
    }

    if (webhook.eventType === "subscription.expired") {
      // Final subscription state update
      await db
        .update(subscription)
        .set({
          status: "expired",
          updatedAt: new Date(),
        })
        .where(eq(subscription.id, webhook.object.id));
    }
  }

  // Confirm webhook processing
  return NextResponse.json({
    success: true,
    message: "Webhook received successfully",
  });
}
