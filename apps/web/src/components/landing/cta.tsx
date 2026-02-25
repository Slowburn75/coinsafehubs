import Link from "next/link"
import { ArrowRight, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTA() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Decorative Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full border border-zinc-100 dark:border-zinc-900 -z-10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[900px] w-[900px] rounded-full border border-zinc-50 dark:border-zinc-900/50 -z-10" />

            <div className="container mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto rounded-[2.5rem] bg-[#1E3A8A] dark:bg-[#1E3A8A]/90 p-8 md:p-16 text-center space-y-8 relative shadow-2xl overflow-hidden">
                    {/* Accent Glow */}
                    <div className="absolute top-0 right-0 h-full w-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent" />

                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-blue-300 backdrop-blur-sm relative z-10">
                        <Trophy className="h-4 w-4" />
                        Top-Rated Fintech Architecture 2026
                    </div>

                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight relative z-10">
                        Start Growing Your Digital <br className="hidden md:block" />
                        Investments Today.
                    </h2>

                    <p className="text-lg text-blue-100/60 max-w-2xl mx-auto relative z-10">
                        Join thousands of professional investors who trust our secure, transparent,
                        and automated platform for their asset growth needs.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 pt-4">
                        <Link href="/signup" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full h-14 px-10 rounded-2xl bg-white text-[#1E3A8A] hover:bg-blue-50 transition-colors font-bold text-lg gap-2">
                                Create Free Account
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>

                    <p className="text-sm text-zinc-500 dark:text-blue-900/50 relative z-10">
                        No long-term contracts. No setup fees. Secure verification required.
                    </p>
                </div>
            </div>
        </section>
    )
}
