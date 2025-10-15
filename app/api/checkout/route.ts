/**
 * Checkout API Route
 *
 * Handles creation of checkout sessions using the Creem SDK.
 * Requires authentication and integrates with Next.js Auth.js.
 *
 * @module api/checkout
 */

import { NextRequest, NextResponse } from "next/server";
import { Creem } from "creem";
import { auth } from 'auth';
import { headers } from "next/headers";

/**
 * Checkout Session Interface
 * Represents the structure of a Creem checkout session response
 */
export interface CheckoutSession {
  /** Unique identifier for the checkout session */
  id: string;
  /** Type of object (always "checkout_session") */
  object: string;
  /** ID of the product being purchased */
  product: string;
  /** Current status of the checkout session */
  status: string;
  /** URL where the customer completes the purchase */
  checkout_url: string;
  /** URL to redirect after successful payment */
  success_url: string;
  /** Payment mode (subscription or one-time) */
  mode: string;
}

/**
 * Initialize Creem SDK client
 * Server index 1 is used for test environment
 */
const creem = new Creem();

/**
 * GET /api/checkout
 *
 * Creates a new checkout session for a specific product.
 * Requires authentication and product ID as query parameter.
 *
 * @async
 * @function
 * @param {NextRequest} req - Next.js request object containing:
 *   - product_id: Query parameter for the product to purchase
 *
 * @returns {Promise<NextResponse>} JSON response containing:
 * - On success: { success: true, checkoutUrl: string }
 * - On error: { error: string } with appropriate status code
 *
 * @example
 * // Request
 * GET /api/checkout?product_id=prod_123
 *
 * // Success Response
 * {
 *   "success": true,
 *   "checkoutUrl": "https://checkout.creem.io/cs_123..."
 * }
 */
export async function GET(req: NextRequest) {
  // Get authenticated session from Auth.js
  const session = await auth();
  const productId = req.nextUrl.searchParams.get("product_id");
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  // Verify authentication and product ID
  if (!session?.user?.id || !productId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.CREEM_API_KEY;
  const successUrl = process.env.SUCCESS_URL;

  try {
    // Create checkout session using Creem SDK
    // This initiates the payment process and returns a checkout URL
    const checkoutSessionResponse = await creem.createCheckout({
      xApiKey: apiKey!,
      createCheckoutRequest: {
        productId: productId as string,
        successUrl: successUrl as string,
        // Link checkout to user for tracking and fulfillment
        requestId: session?.user.id as string,
        // Additional metadata for order processing and customer info
        metadata: {
          email: session?.user.email as string,
          name: session?.user.name as string,
          userId: session?.user.id as string,
          workspaceId: workspaceId as string,
          myCustomField: "myCustomValue",
        },
      },
    });

    // Return checkout URL for client-side redirect
    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSessionResponse.checkoutUrl,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
