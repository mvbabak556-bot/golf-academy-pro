"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Stars from "@/components/Stars";
import { useCartStore } from "@/lib/store";
import { discountPercent, faNum, faPrice } from "@/lib/format";
import type { ProductCardData } from "@/lib/types";

export default function ProductCard({
  p,
  index = 0,
}: {
  p: ProductCardData;
  index?: number;
}) {
  const add = useCartStore((s) => s.add);
  const openCart = useCartStore((s) => s.open);
  const off = discountPercent(p.price, p.oldPrice);

  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <Link
        href={`/product/${p.slug}`}
        className="block overflow-hidden rounded-3xl border border-gold-500/10 bg-forest-900 transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-500/30 hover:shadow-[0_24px_60px_-20px_rgba(201,162,75,0.25)]"
      >
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden bg-forest-850">
          <Image
            src={p.image}
            alt={p.name}
            fill
            sizes="(max-width:640px) 90vw, (max-width:1024px) 45vw, 25vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-108"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-40" />

          {/* Badges */}
          <div className="absolute start-3 top-3 flex flex-col gap-2">
            {p.badge && (
              <span className="rounded-full bg-gold-500 px-3 py-1 text-[11px] font-black text-forest-950 shadow-lg">
                {p.badge}
              </span>
            )}
            {p.isNew && !p.badge && (
              <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-black text-forest-950 shadow-lg">
                جدید
              </span>
            )}
          </div>
          {off && (
            <span className="absolute end-3 top-3 rounded-full bg-forest-950/80 px-2.5 py-1 text-[11px] font-black text-gold-300 backdrop-blur">
              ٪{faNum(off)} تخفیف
            </span>
          )}

          {/* Quick add */}
          <button
            onClick={(e) => {
              e.preventDefault();
              add(
                {
                  productId: p.id,
                  slug: p.slug,
                  name: p.name,
                  price: p.price,
                  image: p.image,
                },
                1
              );
              openCart();
            }}
            aria-label="افزودن سریع به سبد"
            className="absolute bottom-3 end-3 grid size-11 translate-y-3 place-items-center rounded-full bg-gold-500 text-forest-950 opacity-0 shadow-xl transition-all duration-400 hover:bg-gold-400 group-hover:translate-y-0 group-hover:opacity-100"
          >
            <Plus size={19} strokeWidth={2.4} />
          </button>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-sage">{p.category}</span>
            <span className="flex items-center gap-1 text-[11px] text-sage">
              <Stars value={p.rating} size={11} />
              <span className="ms-1">({faNum(p.reviewCount)})</span>
            </span>
          </div>
          <h3 className="mt-2 line-clamp-1 text-base font-bold text-cream transition-colors group-hover:text-gold-300">
            {p.name}
          </h3>
          <div className="mt-3 flex items-end justify-between gap-2">
            <div>
              {p.oldPrice && (
                <span className="block text-xs text-sage/70 line-through">
                  {faPrice(p.oldPrice)}
                </span>
              )}
              <span className="text-base font-black text-gold-300">{faPrice(p.price)}</span>
            </div>
            {p.stock <= 8 && (
              <span className="rounded-full border border-gold-500/30 px-2 py-0.5 text-[10px] font-medium text-gold-400">
                {p.stock <= 4 ? `تنها ${faNum(p.stock)} عدد` : "موجودی محدود"}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
