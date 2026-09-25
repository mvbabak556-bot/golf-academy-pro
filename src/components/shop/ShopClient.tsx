"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, PackageSearch, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { faNum, faPrice } from "@/lib/format";
import type { ProductCardData } from "@/lib/types";

type SortKey = "popular" | "rating" | "cheap" | "expensive" | "new";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "محبوب‌ترین" },
  { key: "new", label: "جدیدترین" },
  { key: "cheap", label: "ارزان‌ترین" },
  { key: "expensive", label: "گران‌ترین" },
  { key: "rating", label: "بالاترین امتیاز" },
];

export default function ShopClient({
  items,
  initialCat,
}: {
  items: ProductCardData[];
  initialCat: string | null;
}) {
  const maxBound = Math.max(1_000_000, ...items.map((i) => i.price));
  const [cats, setCats] = useState<string[]>(
    initialCat && items.some((i) => i.category === initialCat) ? [initialCat] : []
  );
  const [sort, setSort] = useState<SortKey>("popular");
  const [maxPrice, setMaxPrice] = useState<number>(maxBound);
  const [inStock, setInStock] = useState(false);
  const [q, setQ] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const allCats = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((i) => map.set(i.category, (map.get(i.category) ?? 0) + 1));
    return [...map.entries()];
  }, [items]);

  const filtered = useMemo(() => {
    const query = q.trim();
    const list = items.filter(
      (i) =>
        (cats.length === 0 || cats.includes(i.category)) &&
        i.price <= maxPrice &&
        (!inStock || i.stock > 0) &&
        (query === "" || i.name.includes(query))
    );
    switch (sort) {
      case "cheap":
        return [...list].sort((a, b) => a.price - b.price);
      case "expensive":
        return [...list].sort((a, b) => b.price - a.price);
      case "rating":
        return [...list].sort((a, b) => b.rating - a.rating);
      case "new":
        return [...list].sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id);
      default:
        return [...list].sort((a, b) => b.reviewCount - a.reviewCount);
    }
  }, [items, cats, maxPrice, inStock, q, sort]);

  const toggleCat = (c: string) =>
    setCats((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const reset = () => {
    setCats([]);
    setMaxPrice(maxBound);
    setInStock(false);
    setQ("");
    setSort("popular");
  };

  const hasFilters = cats.length > 0 || maxPrice < maxBound || inStock || q.trim() !== "";

  const FiltersPanel = (
    <div className="space-y-8">
      {/* Search */}
      <div>
        <label className="mb-3 block text-sm font-black text-gold-300">جستجو</label>
        <div className="relative">
          <Search size={16} className="absolute start-4 top-1/2 -translate-y-1/2 text-sage" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="نام محصول..."
            className="h-12 w-full rounded-2xl border border-gold-500/15 bg-forest-950/60 ps-11 pe-4 text-sm outline-none transition-colors placeholder:text-sage/50 focus:border-gold-500/50"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="mb-3 block text-sm font-black text-gold-300">دسته‌بندی</label>
        <div className="space-y-2">
          {allCats.map(([c, n]) => {
            const active = cats.includes(c);
            return (
              <button
                key={c}
                onClick={() => toggleCat(c)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all ${
                  active
                    ? "border-gold-500/50 bg-gold-500/10 font-bold text-gold-200"
                    : "border-gold-500/10 bg-forest-950/40 text-cream/75 hover:border-gold-500/25"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`grid size-5 place-items-center rounded-md border transition-colors ${
                      active ? "border-gold-400 bg-gold-500 text-forest-950" : "border-forest-600"
                    }`}
                  >
                    {active && <Check size={13} strokeWidth={3} />}
                  </span>
                  {c}
                </span>
                <span className="text-xs text-sage">({faNum(n)})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="mb-3 block text-sm font-black text-gold-300">حداکثر قیمت</label>
        <input
          dir="ltr"
          type="range"
          min={0}
          max={maxBound}
          step={250_000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-sage">
          <span>تا {faPrice(maxPrice)}</span>
          <button
            onClick={() => setMaxPrice(maxBound)}
            className="text-gold-400 transition-colors hover:text-gold-300"
          >
            حذف محدودیت
          </button>
        </div>
      </div>

      {/* Stock */}
      <button
        onClick={() => setInStock((v) => !v)}
        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-sm transition-all ${
          inStock
            ? "border-gold-500/50 bg-gold-500/10 font-bold text-gold-200"
            : "border-gold-500/10 bg-forest-950/40 text-cream/75"
        }`}
      >
        فقط کالاهای موجود
        <span
          className={`relative h-6 w-11 rounded-full transition-colors ${
            inStock ? "bg-gold-500" : "bg-forest-700"
          }`}
        >
          <span
            className={`absolute top-1 size-4 rounded-full bg-forest-950 transition-all ${
              inStock ? "start-6" : "start-1"
            }`}
          />
        </span>
      </button>

      {hasFilters && (
        <button
          onClick={reset}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-forest-600 py-3 text-sm font-bold text-sage transition-colors hover:border-gold-500/40 hover:text-gold-300"
        >
          <RotateCcw size={15} />
          حذف همه فیلترها
        </button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      {/* Head */}
      <div className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-sage">
          <Link href="/" className="transition-colors hover:text-gold-300">
            خانه
          </Link>
          <ChevronDown size={12} className="-rotate-90" />
          <span className="text-gold-300">فروشگاه</span>
        </nav>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">
          فروشگاه <span className="text-gold-grad">پات‌کلاب</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-sage">
          تجهیزات دست‌چین‌شده برای هر سطح از بازی؛ از اولین پات تا برد آخرین هول.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
        {/* Sidebar (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-3xl border border-gold-500/10 bg-forest-900/60 p-6">
            <h2 className="mb-6 flex items-center gap-2 text-base font-black">
              <SlidersHorizontal size={17} className="text-gold-400" />
              فیلترها
            </h2>
            {FiltersPanel}
          </div>
        </aside>

        {/* Main */}
        <div>
          {/* Toolbar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => setFiltersOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 px-5 py-2.5 text-sm font-bold text-gold-300 lg:hidden"
            >
              <SlidersHorizontal size={15} />
              فیلترها
              {hasFilters && <span className="size-2 rounded-full bg-gold-500" />}
            </button>
            <span className="text-sm text-sage">{faNum(filtered.length)} کالا</span>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none rounded-full border border-gold-500/20 bg-forest-900 py-2.5 ps-4 pe-10 text-sm font-bold text-cream outline-none transition-colors focus:border-gold-500/50"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key} className="bg-forest-900">
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-gold-400"
              />
            </div>
          </div>

          {/* Mobile filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden lg:hidden"
              >
                <div className="mb-8 rounded-3xl border border-gold-500/10 bg-forest-900/60 p-6">
                  {FiltersPanel}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-gold-500/20 py-24 text-center">
              <PackageSearch size={44} className="text-gold-500/60" strokeWidth={1.4} />
              <p className="text-lg font-bold">محصولی یافت نشد</p>
              <p className="max-w-xs text-sm leading-6 text-sage">
                فیلترها را تغییر دهید یا عبارت دیگری جستجو کنید.
              </p>
              <button
                onClick={reset}
                className="mt-2 rounded-full bg-gold-500 px-6 py-3 text-sm font-black text-forest-950"
              >
                حذف فیلترها
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p, i) => (
                <ProductCard key={p.id} p={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
