import { UserPlus, CreditCard, PieChart, Coins } from "lucide-react"

const steps = [
    {
        title: "Create Account",
        description: "Sign up in seconds and complete our seamless KYC verification process.",
        icon: UserPlus,
    },
    {
        title: "Choose Plan",
        description: "Select from a variety of diversified, expert-vetted investment plans.",
        icon: CreditCard,
    },
    {
        title: "Monitor Growth",
        description: "Track your earnings in real-time with our advanced analytics dashboard.",
        icon: PieChart,
    },
    {
        title: "Withdraw Earnings",
        description: "Instantly withdraw your profits to your preferred wallet or bank.",
        icon: Coins,
    }
]

export function HowItWorks() {
    return (
        <section id="how-it-works" className="py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Process</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                        Start Your Journey in 4 Simple Steps
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
                    {/* Connector Line (Desktop) */}
                    <div className="hidden lg:block absolute top-12 left-24 right-24 h-0.5 bg-zinc-100 dark:bg-zinc-800 -z-10" />

                    {steps.map((step, idx) => (
                        <div key={idx} className="flex flex-col items-center text-center space-y-6">
                            <div className="relative group">
                                <div className="h-20 w-20 rounded-full bg-white dark:bg-zinc-950 border-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-center shadow-lg transition-all group-hover:border-emerald-500 group-hover:shadow-emerald-500/10">
                                    <step.icon className="h-8 w-8 text-zinc-900 dark:text-white group-hover:text-emerald-600 transition-colors" />
                                </div>
                                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md border-2 border-white dark:border-zinc-900">
                                    {idx + 1}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{step.title}</h4>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[200px] leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
