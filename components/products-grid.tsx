"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/shadui/card";
import { Button } from "@/components/shadui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadui/tooltip";
import { useEffect, useState } from "react";
import { workspaceStore } from '@/lib/stores/workspace';


interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  imageUrl?: string;
  status: string;
  billingType: string;
  billingPeriod: string;
  mode: string;
  object: string;
}

export function ProductsGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleCheckout = async (productId: string) => {

    const workspaceId = workspaceStore.getCurrentWorkspaceId();
    try {
      setIsProcessing(productId);
      const response = await fetch(`/api/checkout?product_id=${productId}&workspaceId=${workspaceId}`);
      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }
      const data = await response.json();
      
      if (!data.checkoutUrl) {
        throw new Error("Invalid checkout URL received");
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      setError(err instanceof Error ? err.message : "Failed to process checkout");
    } finally {
      setIsProcessing(null);
    }
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();

        // Debug the response structure
        console.log("API Response:", data);

        if (!data.items || !Array.isArray(data.items)) {
          console.error("Invalid data format:", data);
          throw new Error("Invalid data format from API");
        }
        setProducts(data.items);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch products",
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (error) {
    return (
      <Card className="p-4 md:p-6 border border-red-800 bg-black/40 backdrop-blur">
        <p className="text-red-400">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-neutral-400 hover:text-neutral-200"
        >
          Try again
        </button>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="p-4 md:p-6 border border-neutral-800 bg-black/40 backdrop-blur animate-pulse"
          >
            <div className="space-y-4">
              <div className="h-6 bg-neutral-800 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-800 rounded w-full"></div>
              <div className="flex items-center justify-between">
                <div className="h-6 bg-neutral-800 rounded w-1/4"></div>
                <div className="h-9 bg-neutral-800 rounded w-1/3"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">
      {products.map((product) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group"
        >
          <Card className="p-4 md:p-6 border border-neutral-800 bg-black/40 backdrop-blur hover:border-neutral-700 transition-all h-full">
            <div className="flex flex-col h-full space-y-4">
              {product.imageUrl && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden flex-none">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex-1 space-y-4">
                <div className="font-mono text-neutral-200">{product.name}</div>
                <p className="text-neutral-500 text-sm line-clamp-2">
                  {product.description.replace(/[#*`]/g, "")}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-neutral-800/50">
                <div className="space-y-1">
                  <span className="text-neutral-200 font-mono">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: product.currency,
                      minimumFractionDigits: 2,
                    }).format(product.price / 100)}
                  </span>
                  <div className="text-xs text-neutral-500">
                    {product.billingType === "recurring"
                      ? `Billed ${product.billingPeriod.replace("every-", "")}`
                      : "One-time payment"}
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-neutral-800 text-neutral-200 hover:bg-neutral-800/20"
                        onClick={() => handleCheckout(product.id)}
                        disabled={isProcessing === product.id}
                      >
                        {isProcessing === product.id ? (
                          "Processing..."
                        ) : product.billingType === "recurring" ? (
                          "Subscribe"
                        ) : (
                          "Buy Now"
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Subscribe to {product.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
