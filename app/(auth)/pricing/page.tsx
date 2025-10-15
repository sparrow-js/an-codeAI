

import { Products } from "@/components/products";
import Footer from "@/components/footer";
import type { Metadata } from 'next';
import { Header } from "@/components/header/Header";

export const metadata: Metadata = {
  title: 'Pricing Plans',
  description: 'Choose the perfect plan for your AI-powered development needs. Start free and scale as you grow with needware\'s flexible pricing options.',
  openGraph: {
    title: 'Pricing Plans | needware',
    description: 'Choose the perfect plan for your AI-powered development needs. Start free and scale as you grow.',
    type: 'website',
  },
  twitter: {
    title: 'Pricing Plans | needware',
    description: 'Choose the perfect plan for your AI-powered development needs. Start free and scale as you grow.',
  },
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <div className="mt-6">
        <div className="min-h-screen flex flex-col items-center justify-center bg-bolt-elements-background-depth-2">
        <div className="w-full max-w-5xl px-4 py-12">
            <h1 className="text-4xl font-bold text-center mb-6">Pricing</h1>
            <p className="text-lg text-center mb-10 text-muted-foreground">
                Start for free. Upgrade as you go.
            </p>
            <Products />
        </div>
        </div>
        <Footer />
    </div>

    </>

  );
}