import Link from "next/link"
import { Shield, Twitter, Linkedin, Github, Globe } from "lucide-react"

export function Footer() {
    return (
        <footer className="bg-zinc-50 dark:bg-zinc-950 border-t pt-20 pb-10">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E3A8A]">
                                <Shield className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">CoinSafeHub</span>
                        </Link>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Institutional-grade digital asset management for the next generation of investors.
                            SEC-compliant, audit-verified, and security-first.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-[#1E3A8A] transition-colors">
                                <Twitter className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-[#1E3A8A] transition-colors">
                                <Linkedin className="h-4 w-4" />
                            </Link>
                            <Link href="#" className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-[#1E3A8A] transition-colors">
                                <Globe className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Platform */}
                    <div>
                        <h4 className="font-bold mb-6 text-zinc-900 dark:text-zinc-50">Platform</h4>
                        <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
                            <li><Link href="#features" className="hover:text-[#1E3A8A] transition-colors">Features</Link></li>
                            <li><Link href="#how-it-works" className="hover:text-[#1E3A8A] transition-colors">How It Works</Link></li>
                            <li><Link href="/plans" className="hover:text-[#1E3A8A] transition-colors">Investment Plans</Link></li>
                            <li><Link href="#security" className="hover:text-[#1E3A8A] transition-colors">Security Audit</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold mb-6 text-zinc-900 dark:text-zinc-50">Legal</h4>
                        <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
                            <li><Link href="#" className="hover:text-[#1E3A8A] transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-[#1E3A8A] transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-[#1E3A8A] transition-colors">Cookie Policy</Link></li>
                            <li><Link href="#" className="hover:text-[#1E3A8A] transition-colors">Compliance Disclosure</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-bold mb-6 text-zinc-900 dark:text-zinc-50">Support</h4>
                        <ul className="space-y-4 text-sm text-zinc-500 dark:text-zinc-400">
                            <li><Link href="#faq" className="hover:text-[#1E3A8A] transition-colors">Help Center / FAQ</Link></li>
                            <li><Link href="#" className="hover:text-[#1E3A8A] transition-colors">Contact Support</Link></li>
                            <li><Link href="#" className="hover:text-[#1E3A8A] transition-colors">API Documentation</Link></li>
                            <li><Link href="#" className="hover:text-[#1E3A8A] transition-colors">System Status</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t dark:border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs text-zinc-500 dark:text-zinc-600">
                        © 2026 CoinSafeHub Global Inc. All rights reserved. Registered SEC Adviser.
                    </p>
                    <div className="flex items-center gap-6 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                        <span className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-[#1E3A8A]" /> Secure SSL</span>
                        <span className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-[#1E3A8A]" /> FCA Regulated</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
