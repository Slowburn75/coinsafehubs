import { ShieldCheck, Eye, Zap, AlertTriangle, Fingerprint } from "lucide-react"

export function Security() {
    return (
        <section id="security" className="py-24 bg-zinc-950 text-white overflow-hidden relative">
            {/* Visual Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 blur-[80px]" />

            <div className="container mx-auto px-4 md:px-6 relative">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Main Visual */}
                    <div className="flex-1 w-full order-2 lg:order-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-blue-500/20 backdrop-blur-sm">
                                    <Fingerprint className="h-8 w-8 text-blue-500 mb-4" />
                                    <h4 className="font-bold text-lg mb-2">Biometric Auth</h4>
                                    <p className="text-xs text-zinc-400 leading-relaxed">Multi-factor authentication required for all high-value movements.</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 translate-x-4">
                                    <Eye className="h-8 w-8 text-blue-500 mb-4" />
                                    <h4 className="font-bold text-lg mb-2">Audit Ready</h4>
                                    <p className="text-xs text-zinc-400 leading-relaxed">Real-time immutable ledger providing proof of assets and reserves.</p>
                                </div>
                            </div>
                            <div className="space-y-4 pt-12">
                                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 -translate-x-4">
                                    <AlertTriangle className="h-8 w-8 text-orange-500 mb-4" />
                                    <h4 className="font-bold text-lg mb-2">Fraud Shield</h4>
                                    <p className="text-xs text-zinc-400 leading-relaxed">AI-driven monitoring detecting suspicious patterns instantly.</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-[#1E3A8A] border border-blue-500 shadow-lg shadow-blue-500/20">
                                    <ShieldCheck className="h-8 w-8 text-white mb-4" />
                                    <h4 className="font-bold text-lg mb-2">FCA Compliant</h4>
                                    <p className="text-xs text-blue-100/70 leading-relaxed">Operating under strict regulatory standards for capital safety.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 space-y-8 order-1 lg:order-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-500/20">
                            <Zap className="h-3 w-3 fill-current" />
                            Advanced Asset Protection
                        </div>

                        <h3 className="text-3xl md:text-5xl font-bold leading-tight">
                            Safety is Not an Afterthought. It&apos;s Our <span className="text-blue-400">Foundation.</span>
                        </h3>

                        <p className="text-lg text-zinc-400 leading-relaxed">
                            We employ military-grade AES-256 encryption and hardware security modules (HSM)
                            to ensure your capital remains unreachable by outsiders. Our platform undergoes
                            weekly penetration tests and independent biannual security audits.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "End-to-end data encryption in transit and at rest",
                                "Cold storage for the majority of digital assets",
                                "Advanced multi-signature withdrawal approvals",
                                "Zero-knowledge architecture for privacy"
                            ].map((item, id) => (
                                <li key={id} className="flex items-center gap-3 text-zinc-300">
                                    <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <ShieldCheck className="h-3 w-3 text-blue-400" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}
