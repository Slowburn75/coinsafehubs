"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const faqs = [
    {
        question: "Is CoinSafeHub regulated?",
        answer: "Yes, CoinSafeHub operates under strict regulatory compliance in all jurisdictions we serve. We maintain segregated asset accounts and undergo regular third-party audits to ensure transparency."
    },
    {
        question: "How are my assets secured?",
        answer: "We utilize multi-layer security including AES-256 encryption, multi-signature cold storage for digital assets, and biometric hardware authentication for all significant account operations."
    },
    {
        question: "What is the minimum investment amount?",
        answer: "Minimum investment amounts vary by plan. Our entry-level 'Starter' plans begin at just $100, while institutional-grade plans have higher thresholds for enhanced yields."
    },
    {
        question: "How long do withdrawals take?",
        answer: "Withdrawals are processed instantly through our automated security checks. Depending on your destination (wallet or bank), funds typically arrive within 10 minutes to 24 hours."
    },
    {
        question: "Can I manage multiple investment plans?",
        answer: "Absolutely. Our dashboard allows you to diversify your portfolio by managing multiple active investment plans simultaneously with consolidated real-time reporting."
    }
]

export function FAQ() {
    const [openIndex, setOpenIndex] = React.useState<number | null>(0)

    return (
        <section id="faq" className="py-24 bg-zinc-50 dark:bg-zinc-900/40">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-emerald-600 font-bold uppercase tracking-wider text-sm">Support</h2>
                    <h3 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                        Frequently Asked Questions
                    </h3>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="rounded-2xl border bg-white dark:bg-zinc-950 overflow-hidden transition-all shadow-sm hover:shadow-md"
                        >
                            <button
                                className="flex w-full items-center justify-between p-6 text-left outline-none"
                                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                            >
                                <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        "h-5 w-5 text-zinc-500 transition-transform duration-300",
                                        openIndex === idx && "rotate-180"
                                    )}
                                />
                            </button>
                            <div
                                className={cn(
                                    "grid transition-all duration-300 ease-in-out",
                                    openIndex === idx ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                )}
                            >
                                <div className="overflow-hidden">
                                    <p className="p-6 pt-0 text-zinc-600 dark:text-zinc-400 leading-relaxed border-t dark:border-zinc-900">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
