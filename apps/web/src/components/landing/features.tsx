import {
    Wallet,
    ChartBar,
    LayoutGrid,
    ShieldCheck,
    Headset,
    LockKeyhole
} from "lucide-react"

const features = [
    {
        title: "Secure Transactions",
        description: "Military-grade encryption for all financial movements and asset transfers.",
        icon: Wallet,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
        title: "Real-Time Tracking",
        description: "Monitor your portfolio growth and daily returns with live dashboard updates.",
        icon: ChartBar,
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
        title: "Verified Plans",
        description: "Rigorous vetting process for all investment products to ensure safety and stability.",
        icon: LayoutGrid,
        color: "text-purple-600",
        bg: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
        title: "Transparent ROI",
        description: "No hidden fees. Every percentage of return is tracked and visible in your records.",
        icon: ShieldCheck,
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
        title: "24/7 Priority Support",
        description: "Direct access to our financial support team via live chat and secure ticketing.",
        icon: Headset,
        color: "text-cyan-600",
        bg: "bg-cyan-50 dark:bg-cyan-900/20"
    },
    {
        title: "Multi-layer Security",
        description: "Advanced fraud monitoring and multi-factor authentication for every account.",
        icon: LockKeyhole,
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-900/20"
    }
]

export function Features() {
    return (
        <section id="features" className="py-24 bg-zinc-50 dark:bg-zinc-900/30">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center space-y-4 mb-16 max-w-3xl mx-auto">
                    <h2 className="text-[#1E3A8A] font-bold uppercase tracking-wider text-sm">Features</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                        Institutional-Grade Investment Infrastructure
                    </h3>
                    <p className="text-lg text-zinc-600 dark:text-zinc-400">
                        We combine advanced blockchain technology with traditional financial security models
                        to provide a seamless and safe investment experience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group p-8 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className={`h-12 w-12 rounded-xl ${feature.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                                <feature.icon className={`h-6 w-6 ${feature.color}`} />
                            </div>
                            <h4 className="text-xl font-bold mb-3 text-zinc-900 dark:text-zinc-50">
                                {feature.title}
                            </h4>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
