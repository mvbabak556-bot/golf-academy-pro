import Stars from "@/components/Stars";
import { Reveal, Stagger, StaggerItem } from "@/components/Motion";

const TESTIMONIALS = [
  {
    name: "امیرحسین رضایی",
    role: "عضو پات‌کلاب — هندیکپ ۴",
    text: "درایور Pro V1 دقیقاً همان چیزی بود که بازی‌ام کم داشت. مشاوره تیم پات‌کلاب بر اساس شینگل من بی‌نقص بود و ارسال هم فردای همان روز انجام شد.",
    rating: 5,
  },
  {
    name: "سارا محمدی",
    role: "بازیکن تازه‌کار",
    text: "برای شروع، ست کامل از پات‌کلاب خریدم. کیف چرمی‌اش آن‌قدر شیک بود که در کلوب‌هاوس همه پرسیدند از کجا گرفته‌ام!",
    rating: 5,
  },
  {
    name: "رضا توکلی",
    role: "مربی گلف",
    text: "به شاگردهایم همیشه توپ‌های تور پات‌کلاب را پیشنهاد می‌دهم؛ اسپین روی گرین فوق‌العاده است و قیمت‌ها منصفانه.",
    rating: 4,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="inline-flex items-center gap-3 text-xs font-black tracking-[0.25em] text-gold-400">
            <span className="h-px w-10 bg-gold-500/60" />
            نظر اعضا
            <span className="h-px w-10 bg-gold-500/60" />
          </p>
          <h2 className="mt-4 text-3xl font-black leading-snug sm:text-5xl">
            از زبان <span className="text-gold-grad">گلف‌بازان</span>
          </h2>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="flex h-full flex-col rounded-3xl border border-gold-500/10 bg-forest-900 p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold-500/30">
                <Stars value={t.rating} size={15} />
                <blockquote className="mt-5 flex-1 text-sm leading-8 text-cream/85">
                  «{t.text}»
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-gold-500/10 pt-5">
                  <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-base font-black text-forest-950">
                    {t.name.charAt(0)}
                  </span>
                  <div>
                    <div className="text-sm font-black">{t.name}</div>
                    <div className="mt-0.5 text-[11px] text-sage">{t.role}</div>
                  </div>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
