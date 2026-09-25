"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Gift, Send } from "lucide-react";
import { Reveal } from "@/components/Motion";

export default function CtaBanner() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="pb-24 sm:pb-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-gold-500/20 bg-gradient-to-l from-forest-800 via-forest-850 to-forest-900 px-6 py-14 text-center sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="absolute -top-24 -end-24 size-72 rounded-full bg-gold-500/15 blur-3xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-24 -start-24 size-72 rounded-full bg-gold-600/10 blur-3xl"
            />

            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 px-4 py-1.5 text-xs font-bold text-gold-300">
                <Gift size={14} />
                ۱۰٪ تخفیف اولین خرید اعضا
              </span>
              <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-black leading-snug sm:text-4xl">
                به باشگاه <span className="text-gold-grad">پات‌کلاب</span> بپیوندید
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-sage">
                زودتر از همه از کالکشن‌های جدید، تخفیف‌های اختصاصی و نکات مربیان حرفه‌ای باخبر
                شوید.
              </p>

              {done ? (
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-forest-950/60 px-6 py-4 text-sm font-bold text-gold-300"
                >
                  <CheckCircle2 size={18} className="text-gold-400" />
                  خوش آمدید! کد تخفیف برایتان ایمیل شد.
                </motion.p>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (email.trim()) setDone(true);
                  }}
                  className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ایمیل شما"
                    className="h-13 flex-1 rounded-full border border-gold-500/20 bg-forest-950/60 px-5 text-sm text-cream placeholder:text-sage/60 outline-none backdrop-blur transition-colors focus:border-gold-400"
                  />
                  <button
                    type="submit"
                    className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-gold-500 px-7 text-sm font-black text-forest-950 transition-colors hover:bg-gold-400"
                  >
                    عضویت
                    <Send size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
