"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Search,
  TrendingUp,
  Users,
  Zap,
  CheckCircle2,
  Clock,
  DollarSign,
  ChevronRight,
  Instagram,
  Facebook,
  Twitter,
  Globe,
  Loader2
} from "lucide-react";

const BACKEND_URL = "https://flowgrow.onrender.com";

export default function Home() {
  const [role, setRole] = useState<"creator" | "promoter">("creator");
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    const authenticate = async () => {
      try {
        if (typeof window !== "undefined") {
          // Safe localStorage access
          try {
            const savedUser = localStorage.getItem("flowgrow_user");
            if (savedUser && savedUser !== "undefined") {
              const parsed = JSON.parse(savedUser);
              if (parsed && parsed.id) {
                setUser(parsed);
                setLoading(false);
                return;
              }
            }
          } catch (e) {
            console.error("Local storage parse error:", e);
            localStorage.removeItem("flowgrow_user");
          }

          const webapp = window.Telegram?.WebApp;
          if (webapp && webapp.initData) {
            webapp.ready();
            webapp.expand();

            const res = await fetch(`${BACKEND_URL}/auth/telegram`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ initData: webapp.initData })
            });
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              try {
                localStorage.setItem("flowgrow_user", JSON.stringify(data.user));
              } catch (e) {
                console.error("Local storage set error:", e);
              }
            }
          }
        }
      } catch (e) {
        console.error("Auth error:", e);
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="h-screen bg-[#050510] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  useEffect(() => {
    if (!loading && !user && mounted) {
      const isTelegram = typeof window !== "undefined" && window.Telegram?.WebApp?.initData;
      if (!isTelegram) {
        router.push("/login");
      }
    }
  }, [loading, user, mounted, router]);

  return (
    <main className="min-h-screen bg-[#050510] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />

      {/* Header */}
      <nav className="relative z-10 p-6 flex justify-between items-center backdrop-blur-md border-b border-white/5 bg-slate-950/50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Zap className="text-white fill-white" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            FLOWGROW
          </span>
        </div>
        <div className="flex bg-slate-900/80 p-1 rounded-full border border-white/10">
          <button
            onClick={() => setRole("creator")}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${role === "creator" ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            女孩
          </button>
          <button
            onClick={() => setRole("promoter")}
            className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${role === "promoter" ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-white"}`}
          >
            推廣者
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto p-6 space-y-8">
        {role === "creator" ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Creator Hero */}
            <header className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                讓美被<span className="text-blue-500 text-glow">世界看見</span>
              </h1>
              <p className="text-slate-400 text-lg">快速在主流社群獲得百萬量級曝光</p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">總計曝光</p>
                <p className="font-bold text-xl">1.2M+</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">推廣人數</p>
                <p className="font-bold text-xl">450+</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">目前在線</p>
                <p className="font-bold text-xl text-green-500">82</p>
              </div>
            </div>

            {/* Platform Selection */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">選擇宣傳平台</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: "Instagram", icon: <Instagram />, color: "from-pink-500 to-orange-500" },
                  { name: "TikTok", icon: <Globe />, color: "from-slate-700 to-slate-900" },
                  { name: "Facebook", icon: <Facebook />, color: "from-blue-600 to-blue-800" },
                  { name: "Threads", icon: <Search />, color: "from-slate-900 to-black" }
                ].map((p) => (
                  <button key={p.name} className="group relative overflow-hidden rounded-3xl p-6 bg-white/5 border border-white/10 hover:border-white/20 transition-all text-left active:scale-[0.98]">
                    <div className={`absolute top-0 right-0 p-4 transition-transform group-hover:scale-110 opacity-20`}>
                      {p.icon}
                    </div>
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center mb-4 shadow-xl`}>
                      {p.icon}
                    </div>
                    <p className="font-bold text-lg">{p.name}</p>
                    <p className="text-xs text-slate-500">預計流量: 50K - 200K</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black text-xl shadow-2xl shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <PlusCircle size={24} />
              立即發佈宣傳任務
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Promoter Hero */}
            <header className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                流量就是<span className="text-purple-500 text-glow">現金</span>
              </h1>
              <p className="text-slate-400 text-lg">分享精選照片，獲取 90% 高額分潤</p>
            </header>

            {/* Wallet Card */}
            <div className="relative overflow-hidden rounded-3xl p-8 bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-white/10">
              <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/10 blur-[80px] rounded-full" />
              <div className="relative z-10 flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-slate-400 text-sm font-medium">可用餘額</p>
                  <p className="text-4xl font-black tracking-tighter text-white">
                    <span className="text-2xl text-slate-400 font-bold mr-1">$</span>
                    12,450
                  </p>
                </div>
                <button className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm">
                  提領
                </button>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">可接任務 (12)</h2>
                <button className="text-xs text-blue-400 font-bold flex items-center gap-1">
                  查看全部 <ChevronRight size={14} />
                </button>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-purple-500/30 transition-all flex items-center gap-4 group">
                    <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 animate-pulse" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-md">INSTAGRAM</span>
                        <span className="text-xs text-slate-500">2 小時前</span>
                      </div>
                      <p className="font-bold">神貓女孩宣傳任務</p>
                      <p className="text-sm text-green-400 font-black">+$500.00</p>
                    </div>
                    <button className="group-hover:bg-purple-600 group-hover:text-white border border-white/10 px-4 py-2 rounded-xl text-sm font-bold transition-all">
                      接單
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .text-glow {
          text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </main>
  );
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            username?: string;
          };
        };
      };
    };
  }
}
