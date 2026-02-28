"use client";

import { useEffect, useState } from "react";
import { Zap, ShieldCheck, TrendingUp, Users, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const BACKEND_URL = "https://flowgrow.onrender.com";
const BOT_USERNAME = "innnnnnnnnnncat_bot"; // TODO: Replace with your actual bot username

export default function LoginPage() {
    const [mounted, setMounted] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);

        // Define the global callback for Telegram Widget
        (window as any).onTelegramAuth = async (user: any) => {
            setIsLoggingIn(true);
            try {
                const res = await fetch(`${BACKEND_URL}/auth/telegram-widget`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(user)
                });
                const data = await res.json();
                if (data.user) {
                    localStorage.setItem("flowgrow_user", JSON.stringify(data.user));
                    router.push("/");
                }
            } catch (e) {
                console.error("Widget login error:", e);
            } finally {
                setIsLoggingIn(false);
            }
        };
    }, [router]);

    useEffect(() => {
        if (mounted) {
            const script = document.createElement("script");
            script.src = "https://telegram.org/js/telegram-widget.js?22";
            script.setAttribute("data-telegram-login", BOT_USERNAME);
            script.setAttribute("data-size", "large");
            script.setAttribute("data-radius", "0");
            script.setAttribute("data-onauth", "onTelegramAuth(user)");
            script.setAttribute("data-request-access", "write");
            script.async = true;

            const container = document.getElementById("telegram-login-container");
            if (container) {
                container.innerHTML = ""; // Clear existing
                container.appendChild(script);
            }
        }
    }, [mounted]);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-[#02020a] text-white selection:bg-blue-500/30 overflow-hidden relative font-sans">
            {/* Dynamic Animated Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/10 blur-[150px] rounded-full animate-delay-2000 animate-pulse" />
                <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full animate-delay-4000 animate-pulse" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 z-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
            <div className="absolute inset-0 z-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

            <div className="relative z-10 container mx-auto px-6 h-screen flex flex-col pt-12">
                {/* Header */}
                <header className="flex justify-between items-center animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/30 ring-1 ring-white/20">
                            <Zap className="text-white fill-white" size={28} />
                        </div>
                        <span className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500">
                            FLOWGROW
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <a href="#" className="hover:text-white transition-colors">如何運作</a>
                        <a href="#" className="hover:text-white transition-colors">分潤機制</a>
                        <a href="#" className="hover:text-white transition-colors">關於我們</a>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto text-center space-y-12">
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-1000 delay-200">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-widest uppercase">
                            <Zap size={14} className="fill-blue-400" /> 全球首創流量交易市場
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-white">
                            讓美的價值 <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-blue-400 to-blue-700 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">被看見</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                            連結頂級創作者與精準社群流量。一個讓每個人都能靠影響力獲取收益的去中心化媒合生態系。
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-6 w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                        <div id="telegram-login-container" className="min-h-[40px] flex items-center justify-center">
                            {/* Widget will be injected here */}
                            {isLoggingIn && <Loader2 className="animate-spin text-blue-500" />}
                        </div>
                        <p className="text-xs text-slate-500 font-medium">點擊上方按鈕透過 Telegram 安全登入</p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700">
                        {[
                            { icon: <ShieldCheck className="text-emerald-400" />, title: "安全擔保", desc: "託管式分潤，確保每筆交易安全透明。" },
                            { icon: <TrendingUp className="text-blue-400" />, title: "精準曝光", desc: "AI 智慧配對，讓流量發揮最大價值。" },
                            { icon: <Users className="text-purple-400" />, title: "多元生態", desc: "橫跨 IG, TikTok, FB 等全球主流平台。" }
                        ].map((f, i) => (
                            <div key={i} className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all text-left group">
                                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl">
                                    {f.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 animate-in fade-in duration-1000 delay-1000">
                    <p className="text-slate-500 text-sm font-medium">© 2026 FLOWLO Ecosystem. All Rights Reserved.</p>
                    <div className="flex gap-8 text-slate-500 font-medium text-sm">
                        <a href="#" className="hover:text-blue-400 transition-colors">隱私條款</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">服務協議</a>
                    </div>
                </footer>
            </div>

            <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .animate-delay-2000 { animation-delay: 2s; }
        .animate-delay-4000 { animation-delay: 4s; }
      `}</style>
        </div>
    );
}
