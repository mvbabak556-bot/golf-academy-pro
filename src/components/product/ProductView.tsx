"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Zap,
} from "lucide-react";
import Stars from "@/components/Stars";
import { useCartStore } from "@/lib/store";
import { discountPercent, faNum, faPrice } from "@/lib/format";

export interface FullProduct {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  shortDesc: string;
  description: string;
  features: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  badge: string | null;
  isNew: boolean;
}

export default function ProductView({ product: p }: { product: FullProduct }) {
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const add = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.open);
  const router = useRouter();
  const off = discountPercent(p.price, p.oldPrice);

  const addToCart = (open = true) => {
    add(
      {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        image: p.images[0],
      },
      qty
    );
    if (open) openCart();
  };

  return (
    <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:gap-16">
      {/* Gallery */}
      <div>
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-gold-500/10 bg-forest-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={p.images[active]}
                alt={p.name}
                fill
                priority
                sizes="(max-width:1024px) 92vw, 46vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {off && (
            <span className="absolute end-4 top-4 rounded-full bg-gold-500 px-3.5 py-1.5 text-xs font-black text-forest-950 shadow-lg">
              ٪{faNum(off)} تخفیف
            </span>
          )}
          {p.badge && (
            <span className="absolute start-4 top-4 rounded-full bg-forest-950/80 px-3.5 py-1.5 text-xs font-black text-gold-300 backdrop-blur">
              {p.badge}
            </span>
          )}
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {p.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`تصویر ${faNum(i + 1)}`}
              className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-all ${
                active === i
                  ? "border-gold-500 opacity-100"
                  : "border-transparent opacity-55 hover:opacity-90"
              }`}
            >
              <Image src={img} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-gold-500/30 px-3.5 py-1.5 text-xs font-bold text-gold-300">
            {p.category}
          </span>
          {p.isNew && (
            <span className="rounded-full bg-cream px-3.5 py-1.5 text-xs font-black text-forest-950">
              جدید
            </span>
          )}
        </div>

        <h1 className="mt-5 text-3xl font-black leading-snug sm:text-4xl">{p.name}</h1>

        <div className="mt-4 flex items-center gap-3">
          <Stars value={p.rating} size={17} />
          <span className="text-sm font-bold text-gold-300">
            {p.rating.toLocaleString("fa-IR")}
          </span>
          <span className="text-sm text-sage">({faNum(p.reviewCount)} دیدگاه)</span>
        </div>

        <div className="mt-6 flex items-end gap-3">
          <span className="text-3xl font-black text-gold-300 sm:text-4xl">
            {faPrice(p.price)}
          </span>
          {p.oldPrice && (
            <span className="pb-1 text-lg text-sage/70 line-through">
              {faPrice(p.oldPrice)}
            </span>
          )}
        </div>

        <p className="mt-6 border-s-2 border-gold-500/40 ps-4 text-sm leading-8 text-cream/80">
          {p.shortDesc}
        </p>

        {/* Features */}
        <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {p.features.map((f) => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-cream/80">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-400">
                <Check size={12} strokeWidth={3} />
              </span>
              {f}
            </li>
          ))}
        </ul>

        {/* Purchase */}
        <div className="mt-9 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-forest-600 bg-forest-850 px-2 py-1.5">
            <button
              onClick={() => setQty((q) => Math.min(p.stock, q + 1))}
              className="grid size-8 place-items-center rounded-full text-cream/80 transition-colors hover:bg-forest-700 hover:text-gold-300"
              aria-label="افزایش"
            >
              <Plus size={15} />
            </button>
            <span className="w-9 text-center text-base font-black">{faNum(qty)}</span>
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="grid size-8 place-items-center rounded-full text-cream/80 transition-colors hover:bg-forest-700 hover:text-gold-300"
              aria-label="کاهش"
            >
              <Minus size={15} />
            </button>
          </div>

          <button
            onClick={() => addToCart()}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-6 py-3.5 text-sm font-black text-gold-300 transition-all hover:bg-gold-500/20 sm:flex-none sm:min-w-44"
          >
            <ShoppingBag size={17} />
            افزودن به سبد
          </button>
          <button
            onClick={() => {
              addToCart(false);
              router.push("/checkout");
            }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-500 px-6 py-3.5 text-sm font-black text-forest-950 shadow-[0_14px_36px_-12px_rgba(201,162,75,0.55)] transition-all hover:bg-gold-400 sm:flex-none sm:min-w-40"
          >
            <Zap size={16} />
            خرید فوری
          </button>
        </div>

        {/* Trust row */}
        <div className="mt-9 grid grid-cols-1 gap-3 rounded-3xl border border-gold-500/10 bg-forest-900/60 p-5 sm:grid-cols-3">
          <div className="flex items-center gap-2.5 text-xs text-sage">
            <Package size={17} className="shrink-0 text-gold-400" />
            {p.stock > 5 ? (
              <span>
                موجود در انبار
                <span className="block text-cream/70">آماده ارسال</span>
              </span>
            ) : (
              <span>
                فقط {faNum(p.stock)} عدد
                <span className="block text-gold-300">موجودی محدود</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 text-xs text-sage">
            <Truck size={17} className="shrink-0 text-gold-400" />
            ارسال ۲۴ ساعته
            <span className="sr-only">به سراسر کشور</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-sage">
            <ShieldCheck size={17} className="shrink-0 text-gold-400" />
            ضمانت اصالت کالا
          </div>
        </div>

        {/* Description */}
        <div className="mt-9 border-t border-gold-500/10 pt-8">
          <h2 className="flex items-center gap-2 text-lg font-black">
            <BadgeCheck size={19} className="text-gold-400" />
            معرفی محصول
          </h2>
          <p className="mt-4 text-sm leading-8 text-cream/75">{p.description}</p>
        </div>
      </div>
    </div>
  );
}
