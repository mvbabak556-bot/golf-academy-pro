"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, PenLine, Quote, Star, User } from "lucide-react";
import Stars from "@/components/Stars";
import { Reveal } from "@/components/Motion";
import { faDate, faNum } from "@/lib/format";
import type { ReviewData } from "@/lib/types";

export default function ReviewsSection({
  productId,
  rating,
  reviewCount,
  initialReviews,
}: {
  productId: number;
  rating: number;
  reviewCount: number;
  initialReviews: ReviewData[];
}) {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [stars, setStars] = useState(5);
  const [hover, setHover] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const dist = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      counts[Math.min(5, Math.max(1, r.rating)) - 1]++;
    });
    return counts.reverse(); // [5,4,3,2,1]
  }, [reviews]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2 || text.trim().length < 5) {
      setError("لطفاً نام و متن دیدگاه را کامل وارد کنید.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, author: name.trim(), rating: stars, comment: text.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReviews((prev) => [data.review, ...prev]);
      setDone(true);
      setName("");
      setText("");
      setStars(5);
      router.refresh();
      setTimeout(() => setDone(false), 4000);
    } catch {
      setError("ثبت دیدگاه با خطا مواجه شد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-24">
      <Reveal>
        <h2 className="flex items-center gap-3 text-2xl font-black sm:text-3xl">
          <PenLine className="text-gold-400" />
          دیدگاه اعضا
        </h2>
      </Reveal>

      <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr]">
        {/* Summary + form */}
        <div className="space-y-6">
          <Reveal>
            <div className="rounded-3xl border border-gold-500/10 bg-forest-900/60 p-7 text-center">
              <div className="text-5xl font-black text-gold-grad">
                {rating.toLocaleString("fa-IR")}
              </div>
              <Stars value={rating} size={18} className="mt-3 justify-center" />
              <p className="mt-3 text-xs text-sage">
                بر اساس {faNum(reviews.length)} دیدگاه ثبت‌شده
                {reviewCount !== reviews.length && ` از ${faNum(reviewCount)} خرید`}
              </p>
              <div className="mt-6 space-y-2.5">
                {dist.map((count, i) => {
                  const star = 5 - i;
                  const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <span className="flex w-8 items-center gap-1 text-sage" dir="ltr">
                        {star.toLocaleString("fa-IR")}
                        <Star size={11} className="fill-gold-400 text-gold-400" />
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-forest-700">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-l from-gold-300 to-gold-600"
                        />
                      </div>
                      <span className="w-6 text-sage">{faNum(count)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form
              onSubmit={submit}
              className="rounded-3xl border border-gold-500/10 bg-forest-900/60 p-7"
            >
              <h3 className="text-base font-black">دیدگاه شما</h3>
              <div className="mt-5">
                <label className="mb-2 block text-xs font-bold text-sage">امتیاز شما</label>
                <div className="flex items-center gap-1" dir="ltr">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStars(s)}
                      onMouseEnter={() => setHover(s)}
                      onMouseLeave={() => setHover(0)}
                      aria-label={`${s} ستاره`}
                      className="transition-transform hover:scale-115"
                    >
                      <Star
                        size={26}
                        className={
                          s <= (hover || stars)
                            ? "fill-gold-400 text-gold-400"
                            : "fill-transparent text-forest-600"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative mt-4">
                <User size={15} className="absolute start-4 top-1/2 -translate-y-1/2 text-sage" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="نام شما"
                  className="h-12 w-full rounded-2xl border border-gold-500/15 bg-forest-950/60 ps-11 pe-4 text-sm outline-none transition-colors placeholder:text-sage/50 focus:border-gold-500/50"
                />
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="تجربه‌تان از این محصول را بنویسید..."
                rows={4}
                className="mt-3 w-full resize-none rounded-2xl border border-gold-500/15 bg-forest-950/60 px-4 py-3.5 text-sm leading-7 outline-none transition-colors placeholder:text-sage/50 focus:border-gold-500/50"
              />
              {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
              {done && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex items-center gap-1.5 text-xs font-bold text-gold-300"
                >
                  <CheckCircle2 size={14} />
                  دیدگاه شما با موفقیت ثبت شد.
                </motion.p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-500 py-3.5 text-sm font-black text-forest-950 transition-colors hover:bg-gold-400 disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                ثبت دیدگاه
              </button>
            </form>
          </Reveal>
        </div>

        {/* List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="flex h-full min-h-60 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-gold-500/20 text-center">
              <Quote size={36} className="text-gold-500/50" />
              <p className="font-bold">هنوز دیدگاهی ثبت نشده</p>
              <p className="max-w-xs text-sm leading-6 text-sage">
                اولین نفری باشید که تجربه‌اش از این محصول را به اشتراک می‌گذارد.
              </p>
            </div>
          ) : (
            reviews.map((r, i) => (
              <Reveal key={r.id} delay={Math.min(i * 0.06, 0.3)}>
                <article className="rounded-3xl border border-gold-500/10 bg-forest-900/60 p-6 transition-colors hover:border-gold-500/25">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-base font-black text-forest-950">
                        {r.author.charAt(0)}
                      </span>
                      <div>
                        <div className="text-sm font-black">{r.author}</div>
                        <div className="mt-0.5 text-[11px] text-sage">{faDate(r.createdAt)}</div>
                      </div>
                    </div>
                    <Stars value={r.rating} size={14} />
                  </div>
                  <p className="mt-4 text-sm leading-8 text-cream/80">{r.comment}</p>
                </article>
              </Reveal>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
