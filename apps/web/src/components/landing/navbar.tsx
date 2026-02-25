"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Security", href: "#security" },
    { name: "FAQ", href: "#faq" },
]

export function Navbar() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [scrolled, setScrolled] = React.useState(false)

    React.useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    return (
        <nav
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                scrolled
                    ? "border-b bg-white/80 backdrop-blur-md py-3 shadow-sm dark:bg-zinc-950/80"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            CoinSafeHub
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden items-center gap-8 lg:flex">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm font-medium text-zinc-600 transition-colors hover:text-[#1E3A8A] dark:text-zinc-400 dark:hover:text-blue-400"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden items-center gap-4 lg:flex">
                        <Link href="/login">
                            <Button variant="ghost" size="sm">
                                Login
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm" className="bg-[#1E3A8A] hover:bg-[#1e3a8a]/90 text-white font-medium">
                                Sign Up
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="flex h-10 w-10 items-center justify-center rounded-md border lg:hidden"
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={cn(
                    "fixed inset-x-0 top-[73px] z-50 h-[calc(100vh-73px)] border-t bg-white p-6 transition-transform duration-300 dark:bg-zinc-950 lg:hidden",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex flex-col gap-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsOpen(false)}
                            className="text-lg font-semibold text-zinc-900 transition-colors hover:text-[#1E3A8A] dark:text-zinc-50"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <hr className="my-2 border-zinc-100 dark:border-zinc-800" />
                    <div className="flex flex-col gap-4">
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                            <Button variant="outline" className="w-full">
                                Login
                            </Button>
                        </Link>
                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                            <Button className="w-full bg-[#1E3A8A] hover:bg-[#1e3a8a]/90 text-white gap-2 font-bold">
                                Start Investing
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
