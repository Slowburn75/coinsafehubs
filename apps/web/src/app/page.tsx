import type { Metadata } from 'next'
import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Security } from "@/components/landing/security"
import { SocialProof } from "@/components/landing/social-proof"
import { FAQ } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export const metadata: Metadata = {
  title: 'CoinSafeHub | Secure Digital Investment Platform',
  description: 'Institutional-grade asset management. Secure your digital investments with confidence. SEC-compliant, audit-verified, and security-first platform.',
  keywords: ['fintech', 'investment', 'secure', 'assets', 'ROI', 'digital investments', 'portfolio management'],
  openGraph: {
    title: 'CoinSafeHub | Secure Digital Investment Platform',
    description: 'Professional-grade portfolio management for digital assets. High-yield plans with institutional security.',
    type: 'website',
    locale: 'en_US',
    siteName: 'CoinSafeHub',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoinSafeHub | Secure Digital Investment Platform',
    description: 'Institutional-grade asset management for professional investors.',
  }
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-black overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900 dark:selection:bg-emerald-900/40 dark:selection:text-emerald-200">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <Security />
        <SocialProof />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}
