import Link from "next/link"
import { ArrowRight, ShieldCheck, TrendingUp, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
            {/* Background Gradients */}
            <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/10" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Content */}
                    <div className="flex-1 text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="inline-flex items-center gap-2 rounded-full border bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1E3A8A] dark:bg-blue-900/30 dark:text-blue-400">
                            <ShieldCheck className="h-4 w-4" />
                            Regulated and SEC-Compliant Platform
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Secure Your Digital Investments with <span className="text-[#1E3A8A]">Confidence.</span>
                        </h1>

                        <p className="max-w-2xl mx-auto lg:mx-0 text-lg md:text-xl text-zinc-600 dark:text-zinc-400">
                            Professional-grade portfolio management for digital assets. High-yield plans,
                            institutional security, and transparent real-time tracking for every investor.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                            <Link href="/signup" className="w-full sm:w-auto">
                                <Button size="lg" className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white text-md px-8 h-14 rounded-xl gap-2 shadow-lg shadow-blue-500/20 font-bold">
                                    Start Investing
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="#how-it-works" className="w-full sm:w-auto">
                                <Button variant="outline" size="lg" className="w-full text-md px-8 h-14 rounded-xl border-zinc-200 dark:border-zinc-800">
                                    Learn More
                                </Button>
                            </Link>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-8 gap-y-4 pt-8 border-t dark:border-zinc-800">
                            <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                                <Lock className="h-4 w-4" />
                                256-Bit SSL
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                                <TrendingUp className="h-4 w-4" />
                                Real-Time ROI
                            </div>
                            <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 underline decoration-zinc-300">
                                Audit Verified
                            </div>
                        </div>
                    </div>

                    {/* Visual Element (Fintech Illustration / Cards) */}
                    <div className="flex-1 relative w-full max-w-xl animate-in fade-in zoom-in duration-1000">
                        <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 border p-1 shadow-2xl relative">
                            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-blue-500/10 to-transparent" />

                            {/* Mock UI Elements */}
                            <div className="absolute inset-4 space-y-4">
                                <div className="h-12 w-1/3 bg-zinc-50 dark:bg-zinc-900 rounded-xl border animate-pulse" />
                                <div className="h-48 w-full bg-white dark:bg-black rounded-2xl border shadow-sm p-4 relative overflow-hidden">
                                    <div className="h-full w-full bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,#f4f4f5_40px,#f4f4f5_41px)] dark:bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,#27272a_40px,#27272a_41px)]" />
                                    <div className="absolute bottom-10 inset-x-0 h-2 bg-blue-500/20" />
                                    <div className="absolute bottom-10 left-0 h-2 bg-blue-50 w-1/2" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="h-20 flex-1 bg-zinc-50 dark:bg-zinc-900 rounded-xl border" />
                                    <div className="h-20 flex-1 bg-zinc-50 dark:bg-zinc-900 rounded-xl border" />
                                </div>
                            </div>
                        </div>

                        {/* Floating Accents */}
                        <div className="absolute -top-6 -right-6 h-32 w-32 bg-blue-500/10 blur-[60px]" />
                        <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-blue-500/10 blur-[60px]" />
                    </div>
                </div>
            </div>
        </section>
    )
}
