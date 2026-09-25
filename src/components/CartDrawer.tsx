"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { faNum, faPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/data";

export default function CartDrawer() {
  const { items, isOpen, close, remove, setQty } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[80]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            className="absolute inset-0 bg-forest-950/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-y-0 left-0 flex w-full max-w-md flex-col border-e border-gold-500/15 bg-forest-900 shadow-2xl"
          >
            {/* Head */}
            <div className="flex items-center justify-between border-b border-gold-500/10 px-6 py-5">
              <h2 className="flex items-center gap-2.5 text-lg font-bold">
                <ShoppingBag size={20} className="text-gold-400" />
                سبد خرید
                <span className="text-sm font-medium text-sage">
                  ({faNum(items.reduce((s, i) => s + i.qty, 0))} کالا)
                </span>
              </h2>
              <button
                onClick={close}
                aria-label="بستن"
                className="grid size-9 place-items-center rounded-full border border-forest-600/60 text-cream/70 transition-colors hover:border-gold-500/50 hover:text-gold-300"
              >
                <X size={17} />
              </button>
            </div>

            {/* Free shipping bar */}
            {items.length > 0 && (
              <div className="border-b border-gold-500/10 px-6 py-3">
                <div className="flex items-center gap-2 text-xs text-sage">
                  <Truck size={14} className="shrink-0 text-gold-400" />
                  {freeShipping ? (
                    <span className="text-gold-300">ارسال سفارش شما رایگان است!</span>
                  ) : (
                    <span>
                      {faPrice(remaining)} تا ارسال رایگان باقی مانده
                    </span>
                  )}
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-forest-700">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-l from-gold-300 to-gold-600"
                    initial={false}
                    animate={{
                      width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="grid size-20 place-items-center rounded-full border border-gold-500/20 bg-forest-800 text-gold-500/60">
                    <ShoppingBag size={32} strokeWidth={1.4} />
                  </span>
                  <p className="font-bold text-cream">سبد خرید شما خالی است</p>
                  <p className="max-w-60 text-sm leading-6 text-sage">
                    از کالکشن چوب‌ها و توپ‌های تور ما دیدن کنید تا بازی‌تان را ارتقا دهید.
                  </p>
                  <Link
                    href="/shop"
                    onClick={close}
                    className="mt-2 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-bold text-forest-950 transition-transform hover:scale-105"
                  >
                    رفتن به فروشگاه
                    <ArrowLeft size={16} />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-4">
                  <AnimatePresence initial={false}>
                    {items.map((i) => (
                      <motion.li
                        key={i.productId}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -60 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-4 rounded-2xl border border-gold-500/10 bg-forest-850 p-3"
                      >
                        <Link
                          href={`/product/${i.slug}`}
                          onClick={close}
                          className="relative size-20 shrink-0 overflow-hidden rounded-xl"
                        >
                          <Image src={i.image} alt={i.name} fill className="object-cover" sizes="80px" />
                        </Link>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/product/${i.slug}`}
                              onClick={close}
                              className="truncate text-sm font-bold text-cream hover:text-gold-300"
                            >
                              {i.name}
                            </Link>
                            <button
                              onClick={() => remove(i.productId)}
                              aria-label="حذف"
                              className="text-sage transition-colors hover:text-red-400"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                          <span className="mt-1 text-xs text-gold-400">{faPrice(i.price)}</span>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center gap-1 rounded-full border border-forest-600 bg-forest-800 px-1">
                              <button
                                onClick={() => setQty(i.productId, i.qty + 1)}
                                className="grid size-7 place-items-center text-cream/80 hover:text-gold-300"
                                aria-label="افزودن"
                              >
                                <Plus size={13} />
                              </button>
                              <span className="w-6 text-center text-sm font-bold">
                                {faNum(i.qty)}
                              </span>
                              <button
                                onClick={() => setQty(i.productId, i.qty - 1)}
                                className="grid size-7 place-items-center text-cream/80 hover:text-gold-300"
                                aria-label="کاهش"
                              >
                                <Minus size={13} />
                              </button>
                            </div>
                            <span className="text-sm font-bold text-cream/90">
                              {faPrice(i.price * i.qty)}
                            </span>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gold-500/10 bg-forest-950/60 px-6 py-5">
                <div className="mb-1 flex items-center justify-between text-sm text-sage">
                  <span>هزینه ارسال</span>
                  <span className={freeShipping ? "font-bold text-gold-300" : ""}>
                    {freeShipping ? "رایگان" : faPrice(350000)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-lg font-black">
                  <span>جمع کل</span>
                  <span className="text-gold-300">
                    {faPrice(subtotal + (freeShipping ? 0 : 350000))}
                  </span>
                </div>
                <Link
                  href="/checkout"
                  onClick={close}
                  className="group mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 py-3.5 text-sm font-black text-forest-950 transition-all hover:bg-gold-400"
                >
                  تکمیل خرید
                  <ArrowLeft size={17} className="transition-transform group-hover:-translate-x-1" />
                </Link>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
