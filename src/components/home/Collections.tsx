import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { COLLECTIONS } from "@/lib/data";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";

export default function Collections() {
  return (
    <section id="collections" className="relative py-24 sm:py-32">
      <span
        aria-hidden
        className="text-stroke-gold pointer-events-none absolute -top-2 start-0 select-none font-display text-[22vw] font-bold italic leading-none lg:text-[13rem]"
      >
        GOLF
      </span>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <p className="flex items-center gap-3 text-xs font-black tracking-[0.25em] text-gold-400">
              <span className="h-px w-10 bg-gold-500/60" />
              کالکشن‌ها
            </p>
            <h2 className="mt-4 text-3xl font-black leading-snug sm:text-5xl">
              دنیای پات‌کلاب را
              <span className="text-gold-grad"> کاوش کنید</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-sm font-bold text-gold-300 transition-colors hover:text-gold-200"
            >
              مشاهده همه محصولات
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <Stagger className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c) => (
            <StaggerItem key={c.title}>
              <Link
                href={`/shop?cat=${encodeURIComponent(c.cat)}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-3xl border border-gold-500/10"
              >
                <Image
                  src={c.img}
                  alt={c.title}
                  fill
                  sizes="(max-width:640px) 90vw, (max-width:1024px) 45vw, 24vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/95 via-forest-950/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-xl font-black text-cream transition-colors group-hover:text-gold-300">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-6 text-cream/65">{c.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-gold-300">
                    مشاهده کالکشن
                    <span className="grid size-7 place-items-center rounded-full border border-gold-500/40 transition-all group-hover:-translate-x-1 group-hover:bg-gold-500 group-hover:text-forest-950">
                      <ArrowLeft size={13} />
                    </span>
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
