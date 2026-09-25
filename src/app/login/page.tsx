"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flag, Loader2, Lock, LogIn, Mail, Sparkles, UserPlus } from "lucide-react";
import { STOCK } from "@/lib/data";
import type { SessionUser } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("puttclub_user");
      if (raw) router.replace("/panel");
    } catch {
      /* noop */
    }
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login" ? { email, password } : { name, email, password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "خطایی رخ داد. دوباره تلاش کنید.");
        return;
      }
      localStorage.setItem("puttclub_user", JSON.stringify(data.user as SessionUser));
      router.push("/panel");
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setMode("login");
    setEmail("demo@puttclub.ir");
    setPassword("demo1234");
  };

  const inputCls =
    "h-12 w-full rounded-2xl border border-gold-500/15 bg-forest-950/60 ps-11 pe-4 text-sm text-cream outline-none transition-colors placeholder:text-sage/50 focus:border-gold-500/50";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden lg:block">
        <Image
          src={STOCK.swingReady}
          alt="گلف‌باز در حال سوئینگ"
          fill
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-forest-950 via-forest-950/40 to-forest-950/20" />
        <div className="absolute inset-x-0 bottom-0 p-14">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <p className="flex items-center gap-2 text-xs font-black tracking-[0.25em] text-gold-400">
              <Sparkles size={13} />
              باشگاه پات‌کلاب
            </p>
            <p className="mt-4 max-w-md text-2xl font-black leading-[1.8]">
              اعضای باشگاه، به کالکشن‌های اختصاصی، تخفیف‌های ویژه و اولویت ارسال دسترسی دارند.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-4 pb-16 pt-32 sm:px-8 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="grid size-11 place-items-center rounded-full border border-gold-500/40 bg-forest-800 text-gold-400">
              <Flag size={20} strokeWidth={1.8} />
            </span>
            <span className="font-display text-2xl italic">
              Putt<span className="text-gold-400">Club</span>
            </span>
          </div>

          <h1 className="mt-8 text-3xl font-black">
            {mode === "login" ? "ورود به پنل اعضا" : "عضویت در باشگاه"}
          </h1>
          <p className="mt-3 text-sm leading-7 text-sage">
            {mode === "login"
              ? "برای پیگیری سفارش‌ها و مشاهده مزایای باشگاه، وارد شوید."
              : "حساب بسازید و از مزایای اعضا بهره‌مند شوید."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "register" && (
              <div className="relative">
                <LogIn size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-sage" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="نام و نام خانوادگی"
                  required
                  className={inputCls}
                />
              </div>
            )}
            <div className="relative">
              <Mail size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-sage" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ایمیل"
                dir="ltr"
                required
                className={`${inputCls} text-right`}
              />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-sage" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور"
                dir="ltr"
                required
                minLength={6}
                className={`${inputCls} text-right`}
              />
            </div>

            {error && <p className="text-sm font-bold text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-gold-500 text-sm font-black text-forest-950 transition-colors hover:bg-gold-400 disabled:opacity-60"
            >
              {loading ? <Loader2 size={17} className="animate-spin" /> : mode === "login" ? <LogIn size={17} /> : <UserPlus size={17} />}
              {mode === "login" ? "ورود" : "ثبت‌نام"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-sage">
            {mode === "login" ? "حساب ندارید؟" : "قبلاً عضو شده‌اید؟"}{" "}
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              className="font-bold text-gold-300 transition-colors hover:text-gold-200"
            >
              {mode === "login" ? "ثبت‌نام کنید" : "وارد شوید"}
            </button>
          </div>

          {/* Demo hint */}
          <div className="mt-8 rounded-2xl border border-dashed border-gold-500/30 bg-forest-900/60 p-5">
            <p className="text-xs font-bold text-gold-300">حساب نمونه برای تست</p>
            <p className="mt-2 text-xs leading-6 text-sage" dir="ltr">
              demo@puttclub.ir / demo1234
            </p>
            <button
              onClick={fillDemo}
              className="mt-3 text-xs font-bold text-gold-400 underline-offset-4 transition-colors hover:text-gold-300 hover:underline"
            >
              پرکردن خودکار فرم
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-sage">
            <Link href="/" className="transition-colors hover:text-gold-300">
              بازگشت به فروشگاه
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
