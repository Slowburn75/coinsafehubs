import { Star, Quote } from "lucide-react"

const testimonials = [
    {
        name: "Alex Thompson",
        role: "Portfolio Manager",
        content: "The real-time tracking and immutable audit logs give me peace of mind I haven't found on other platforms. Professional grade as advertised.",
        avatar: "AT",
        rating: 5
    },
    {
        name: "Sarah Chen",
        role: "Crypto Investor",
        content: "Seamless KYC process and instant deposit confirmation. The transparent ROI tracking makes it easy to manage my diversified holdings.",
        avatar: "SC",
        rating: 5
    },
    {
        name: "Michael Roberts",
        role: "Tech Entrepreneur",
        content: "Security was my main concern. After reviewing their infrastructure, it's clear CoinSafeHub takes asset protection seriously. Highly recommend.",
        avatar: "MR",
        rating: 5
    }
]

export function SocialProof() {
    return (
        <section className="py-24 bg-white dark:bg-black">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div className="max-w-2xl space-y-4">
                        <h2 className="text-emerald-600 font-bold uppercase tracking-wider text-sm text-center md:text-left">Testimonials</h2>
                        <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 text-center md:text-left">
                            Trusted by Professionals Worldwide
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-full border">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                            ))}
                        </div>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">4.9/5</span>
                        <span className="text-xs text-zinc-500">Global Score</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((t, idx) => (
                        <div
                            key={idx}
                            className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 relative group"
                        >
                            <Quote className="absolute top-6 right-8 h-12 w-12 text-zinc-200 dark:text-zinc-800 -z-0" />
                            <div className="relative z-10 space-y-6">
                                <div className="flex gap-1">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-emerald-500 text-emerald-500" />
                                    ))}
                                </div>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                                    "{t.content}"
                                </p>
                                <div className="flex items-center gap-4 pt-4 border-t dark:border-zinc-800">
                                    <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-zinc-50">{t.name}</h4>
                                        <p className="text-xs text-zinc-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
