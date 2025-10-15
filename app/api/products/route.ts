/**
 * Products API Route
 *
 * This route handles product-related operations using the Creem SDK.
 * Currently implements:
 * - GET: Fetches all available products with pagination
 *
 * @module api/products
 */

import { Creem } from "creem";
import { NextResponse } from "next/server";

/**
 * Initialize Creem SDK client
 * Server index 0 is used for production environment
 */
const creem = new Creem();

/**
 * GET /api/products
 *
 * Fetches all products from Creem's API with pagination support.
 *
 * @async
 * @function
 * @returns {Promise<NextResponse>} JSON response containing:
 * - On success: Array of products with pagination metadata
 * - On error: Error message with 500 status code
 *
 * @example Response format
 * {
 *   items: Array<{
 *     id: string;
 *     name: string;
 *     description: string;
 *     price: number;
 *     ...
 *   }>;
 *   totalItems: number;
 *   totalPages: number;
 *   currentPage: number;
 * }
 */
export async function GET() {
  const apiKey = process.env.CREEM_API_KEY;

  try {
    // Call Creem SDK to fetch products
    // Using larger page size since this is a template with few products
    // For production, consider using smaller page size and implementing pagination in UI
    const products = await creem.searchProducts({
      xApiKey: apiKey as string,
      pageNumber: 0,
      pageSize: 100,
    });

    // Return products with pagination metadata
    // The response structure matches Creem's API format:
    // { items: Product[], totalItems: number, totalPages: number, currentPage: number }
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
