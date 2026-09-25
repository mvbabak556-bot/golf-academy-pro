"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Flag, LayoutGrid, Menu, ShoppingBag, User, X } from "lucide-react";
import { useCartStore } from "@/lib/store";
import type { SessionUser } from "@/lib/types";
import { faNum } from "@/lib/format";

const LINKS = [
  { href: "/", label: "خانه" },
  { href: "/shop", label: "فروشگاه" },
  { href: "/#collections", label: "کالکشن‌ها" },
  { href: "/#testimonials", label: "نظر اعضا" },
  { href: "/#contact", label: "تماس" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const openCart = useCartStore((s) => s.open);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    try {
      const raw = localStorage.getItem("puttclub_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      /* noop */
    }
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || pathname !== "/"
          ? "border-b border-gold-500/10 bg-forest-950/85 backdrop-blur-xl"
          : "bg-gradient-to-b from-forest-950/70 to-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-full border border-gold-500/40 bg-forest-800 text-gold-400 transition-colors group-hover:bg-gold-500 group-hover:text-forest-950">
            <Flag size={20} strokeWidth={1.8} />
          </span>
          <span className="leading-none">
            <span className="block font-display text-xl italic tracking-wide text-cream sm:text-2xl">
              Putt<span className="text-gold-400">Club</span>
            </span>
            <span className="mt-1 block text-[10px] font-medium text-sage">
              فروشگاه تخصصی گلف
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative text-sm font-medium text-cream/80 transition-colors hover:text-gold-300 after:absolute after:-bottom-1.5 after:start-0 after:h-px after:w-0 after:bg-gold-400 after:transition-all after:duration-300 hover:after:w-full"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={user ? "/panel" : "/login"}
            className="hidden items-center gap-2 rounded-full border border-gold-500/30 px-4 py-2 text-sm font-medium text-gold-300 transition-all hover:border-gold-400 hover:bg-gold-500/10 sm:inline-flex"
          >
            <User size={16} strokeWidth={1.8} />
            {mounted && user ? "پنل من" : "ورود اعضا"}
          </Link>

          <button
            onClick={openCart}
            aria-label="سبد خرید"
            className="relative grid size-10 place-items-center rounded-full border border-gold-500/30 bg-forest-800/60 text-cream transition-all hover:border-gold-400 hover:bg-gold-500/10"
          >
            <ShoppingBag size={18} strokeWidth={1.8} />
            {mounted && count > 0 && (
              <motion.span
                key={count}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -top-1.5 -start-1.5 grid size-5 place-items-center rounded-full bg-gold-500 text-[11px] font-bold text-forest-950"
              >
                {faNum(count)}
              </motion.span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="منو"
            className="grid size-10 place-items-center rounded-full border border-gold-500/30 bg-forest-800/60 text-cream lg:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-gold-500/10 bg-forest-950/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-4 py-4 sm:px-6">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-cream/85 transition-colors hover:bg-forest-800 hover:text-gold-300"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href={user ? "/panel" : "/login"}
                onClick={() => setMenuOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-3 text-sm font-bold text-forest-950"
              >
                {user ? <LayoutGrid size={16} /> : <User size={16} />}
                {user ? "پنل اعضا" : "ورود / ثبت‌نام اعضا"}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
