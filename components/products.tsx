"use client";

import { Card } from "@/components/shadui/card";
import { Button } from "@/components/shadui/button";


import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { workspaceStore } from '@/lib/stores/workspace';
import { useToast } from "@/hooks/use-toast";

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
  features?: string[];
  credits?: number;
  isPopular?: boolean;
  summary?: string;
  btnText?: string;
}

// Mock data to match the HTML structure
const localProducts: Product[] = [
    {
      id: "prod_1CYy8zHjvROsgvjs2o6jo2",
      name: "one-time",
      description: "One-time purchase, flexible and efficient solution.",
      price: 1000, // $25 in cents
      currency: "USD",
      billingType: "",
      billingPeriod: "",
      status: "",
      mode: "",
      object: "",
      credits: 30,
      btnText: "Buy Now",
      features: [
        "3 projects can be created",
        "30 monthly credits",
        "Private projects"
      ],
      summary: "Everything in Free, plus:"
    },
    {
      id: "prod_2b7MmbBoPnhLryOjs3kBLE",
      name: "Pro",
      description: "Perfect for individuals and small teams getting started with AI-powered development.",
      price: 2000, // $50 in cents
      currency: "USD",
      billingType: "",
      billingPeriod: "",
      status: "",
      mode: "",
      object: "",
      credits: 80,
      btnText: "Subscribe",
      features: [
        "Download code",
        "80 monthly credits",
        "In-app code edits",
        "Unlimited app creation"
      ],
      summary: "Everything in Free, plus:"
    },
  ];

export function Products() {
  const [products, setProducts] = useState<Product[]>(localProducts);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();





  const handleCheckout = async (productId: string) => {
    // 检查用户是否已登录
    if (!session?.user) {
      router.push('/login');
      return;
    }

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






  if (error) {
    return (
      <Card className="p-4 md:p-6 border border-red-200 bg-red-50 mt-4">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-red-500 hover:text-red-700"
        >
          Try again
        </button>
      </Card>
    );
  }


  return (
    <div className="grid w-fit grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6 lg:flex lg:justify-center lg:max-w-none mx-auto">
        {products.map((product, index) => (
        <div
          key={product.id}
          className={`flex h-full w-full max-w-[360px] flex-col gap-4 rounded-xl border-1 border-[#363633] p-4 pb-6 sm:max-w-none lg:max-w-[360px] shadow-sm hover:shadow-md transition-shadow`}
        >
          {/* Header */}
          <div className="flex flex-col gap-1.5">
            <p className="text-xl font-bold">{product.name}</p>
            <div className="min-h-11 text-sm text-foreground lg:min-h-16">
              {product.description}
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline">
            <div className="flex min-h-11 items-center gap-2">
              <p className="text-3xl font-medium tabular-nums">
                ${Math.round(product.price / 100)}
              </p>
              <p className="text-base text-muted-foreground">per month</p>
            </div>
          </div>

          {/* Action Buttons and Content */}
          <div className="flex flex-col gap-4 min-h-[350px]">
            <div className="flex flex-col justify-start gap-2">
              <Button
                onClick={() => handleCheckout(product.id)}
                disabled={isProcessing === product.id}
                className={`w-full h-9 cursor-pointer ${
                  product.id === "pro"
                    ? "bg-[#5337cd] hover:bg-[#4429b8] text-white"
                    : "bg-[#4a3ba8] hover:bg-[#3d2f94] text-white"
                } transition-colors duration-200`}
                style={{
                  backgroundColor: product.id === "pro" ? "#5337cd" : "#4a3ba8"
                }}
              >
                {isProcessing === product.id ? "Processing..." : product.btnText}
              </Button>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-foreground">
                  {product.summary}
                </p>
                <ul className="flex flex-col gap-4 text-base md:text-sm">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="text-foreground">
                      {feature}
                    </li>
                  ))}
                  
                </ul>
              </div>
            )}


          </div>
        </div>
      ))}
      
      {/* Separate Self-hosted card */}
      <div className="flex h-full w-full max-w-[360px] flex-col gap-4 rounded-xl border-1 border-[#363633] p-4 pb-6 sm:max-w-none lg:max-w-[360px] shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <p className="text-xl font-bold">Self-hosted</p>
          <div className="min-h-11 text-sm text-foreground lg:min-h-16">
            Deploy proprietary vibecode for you
          </div>
        </div>

        {/* Pricing */}
        <div className="flex items-baseline">
          <div className="flex min-h-11 items-center gap-2">
            <p className="text-3xl font-medium tabular-nums">
              Contact Us
            </p>
            <p className="text-base text-muted-foreground">for pricing</p>
          </div>
        </div>

        {/* Action Buttons and Content */}
        <div className="flex flex-col gap-4 min-h-[350px]">
          <div className="flex flex-col justify-start gap-2">
            <Button
              onClick={() => {
                // Handle contact action - could open a modal or redirect to contact page
                window.open('mailto:needwareofficial@gmail.com?subject=Self-hosted Inquiry', '_blank');
              }}
              className="w-full h-9 cursor-pointer bg-[#5337cd] hover:bg-[#4429b8] text-white transition-colors duration-200"
            >
              Contact Sales
            </Button>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-4">
            <p className="text-sm text-foreground">
              Self-hosted Vibecode
            </p>
            <ul className="flex flex-col gap-4 text-base md:text-sm">
              <li className="text-foreground">Deploy on your infrastructure</li>
              <li className="text-foreground">Custom integrations</li>
              <li className="text-foreground">Priority support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
