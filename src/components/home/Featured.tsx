import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { Reveal } from "@/components/Motion";
import type { ProductCardData } from "@/lib/types";

export default function Featured({ items }: { items: ProductCardData[] }) {
  return (
    <section className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-black tracking-[0.25em] text-gold-400">
              <span className="h-px w-10 bg-gold-500/60" />
              منتخب سردبیر
            </p>
            <h2 className="mt-4 text-3xl font-black leading-snug sm:text-5xl">
              پرفروش‌های <span className="text-gold-grad">این فصل</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-sage">
              تجهیزاتی که اعضای پات‌کلاب بیشتر از همه می‌خرند؛ امتحان‌شده در تور و محبوب در
              کلوب‌هاوس.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 rounded-full border border-gold-500/30 px-5 py-2.5 text-sm font-bold text-gold-300 transition-all hover:border-gold-400 hover:bg-gold-500/10"
            >
              همه محصولات
              <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
