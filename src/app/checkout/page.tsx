"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CheckCircle2,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { useCartStore } from "@/lib/store";
import { faNum, faPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/data";

const CITIES = [
  "تهران",
  "کرج",
  "اصفهان",
  "شیراز",
  "مشهد",
  "تبریز",
  "اهواز",
  "قم",
  "رشت",
  "یزد",
  "کرمان",
  "بندرعباس",
];

const STEPS = ["اطلاعات ارسال", "روش پرداخت", "بازبینی و ثبت"];

const PAYMENTS = [
  { key: "gateway", label: "درگاه بانکی (آنلاین)", desc: "پرداخت امن با تمام کارت‌های شتاب", icon: CreditCard },
  { key: "card", label: "کارت به کارت", desc: "ارسال رسید پس از واریز", icon: Landmark },
  { key: "cod", label: "پرداخت در محل", desc: "فقط برای تهران و کرج", icon: Banknote },
];

interface Form {
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  postalCode: string;
  note: string;
}

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const [step, setStep] = useState(0);
  const [payment, setPayment] = useState("gateway");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [form, setForm] = useState<Form>({
    name: "",
    phone: "",
    email: "",
    city: "تهران",
    address: "",
    postalCode: "",
    note: "",
  });

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const validateStep0 = () => {
    if (form.name.trim().length < 3) return "نام و نام خانوادگی را کامل وارد کنید.";
    if (!/^09\d{9}$/.test(form.phone.trim())) return "شماره موبایل معتبر نیست (مثل ۰۹۱۲۳۴۵۶۷۸۹).";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email.trim())) return "ایمیل معتبر نیست.";
    if (form.address.trim().length < 10) return "آدرس را کامل‌تر وارد کنید.";
    if (form.postalCode && !/^\d{10}$/.test(form.postalCode.trim())) return "کد پستی باید ۱۰ رقم باشد.";
    return "";
  };

  const next = () => {
    if (step === 0) {
      const err = validateStep0();
      if (err) return setError(err);
    }
    setError("");
    setStep((s) => Math.min(2, s + 1));
  };

  const submitOrder = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: form, items }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrderCode(data.code);
      setStep(3);
      clear();
    } catch {
      setError("ثبت سفارش با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Success screen ---------- */
  if (step === 3) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 pb-28 pt-40 text-center sm:pt-48">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="grid size-24 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-forest-950 shadow-[0_20px_60px_-10px_rgba(201,162,75,0.6)]"
        >
          <Check size={46} strokeWidth={3} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h1 className="mt-8 text-3xl font-black sm:text-4xl">سفارش شما ثبت شد!</h1>
          <p className="mt-4 text-sm leading-8 text-sage">
            از خرید شما سپاسگزاریم. همکاران ما به‌زودی برای هماهنگی ارسال با شما تماس می‌گیرند.
          </p>
          <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-2xl border border-gold-500/30 bg-forest-900 px-6 py-4">
            <span className="text-xs text-sage">کد پیگیری سفارش:</span>
            <span className="text-lg font-black tracking-widest text-gold-300" dir="ltr">
              {orderCode}
            </span>
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/panel"
              className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-black text-forest-950 transition-colors hover:bg-gold-400"
            >
              پیگیری در پنل اعضا
              <ArrowLeft size={16} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full border border-forest-600 px-7 py-3.5 text-sm font-bold text-cream transition-colors hover:border-gold-500/40 hover:text-gold-300"
            >
              بازگشت به فروشگاه
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------- Empty cart ---------- */
  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 pb-28 pt-44 text-center">
        <span className="grid size-20 place-items-center rounded-full border border-gold-500/20 bg-forest-900 text-gold-500/60">
          <ShoppingBag size={32} strokeWidth={1.4} />
        </span>
        <h1 className="mt-6 text-2xl font-black">سبد خرید شما خالی است</h1>
        <p className="mt-3 text-sm leading-7 text-sage">
          برای تکمیل خرید، ابتدا محصولات مورد نظرتان را به سبد اضافه کنید.
        </p>
        <Link
          href="/shop"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-black text-forest-950"
        >
          رفتن به فروشگاه
          <ArrowLeft size={16} />
        </Link>
      </div>
    );
  }

  const inputCls =
    "h-12 w-full rounded-2xl border border-gold-500/15 bg-forest-950/60 px-4 text-sm text-cream outline-none transition-colors placeholder:text-sage/50 focus:border-gold-500/50";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      <h1 className="text-3xl font-black sm:text-4xl">
        تکمیل <span className="text-gold-grad">خرید</span>
      </h1>

      {/* Stepper */}
      <div className="mt-10 flex items-center">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <span
                className={`grid size-10 place-items-center rounded-full border text-sm font-black transition-all duration-500 ${
                  i < step
                    ? "border-gold-500 bg-gold-500 text-forest-950"
                    : i === step
                      ? "border-gold-500 text-gold-300"
                      : "border-forest-600 text-sage"
                }`}
              >
                {i < step ? <Check size={16} strokeWidth={3} /> : faNum(i + 1)}
              </span>
              <span
                className={`hidden text-xs sm:block ${
                  i <= step ? "font-bold text-gold-300" : "text-sage"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="relative mx-3 mb-0 h-px flex-1 bg-forest-700 sm:mb-6">
                <motion.div
                  className="absolute inset-y-0 start-0 bg-gold-500"
                  initial={false}
                  animate={{ width: i < step ? "100%" : "0%" }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Steps content */}
        <div>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="s0"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="rounded-3xl border border-gold-500/10 bg-forest-900/60 p-7 sm:p-9"
              >
                <h2 className="flex items-center gap-2.5 text-lg font-black">
                  <MapPin size={19} className="text-gold-400" />
                  اطلاعات ارسال
                </h2>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold text-sage">
                      نام و نام خانوادگی *
                    </label>
                    <input value={form.name} onChange={set("name")} placeholder="مثلاً علی رضایی" className={inputCls} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-sage">شماره موبایل *</label>
                    <input value={form.phone} onChange={set("phone")} placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" className={`${inputCls} text-right`} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-sage">ایمیل (اختیاری)</label>
                    <input value={form.email} onChange={set("email")} placeholder="you@example.com" dir="ltr" className={`${inputCls} text-right`} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-sage">شهر *</label>
                    <select value={form.city} onChange={set("city")} className={inputCls}>
                      {CITIES.map((c) => (
                        <option key={c} value={c} className="bg-forest-900">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-bold text-sage">آدرس کامل *</label>
                    <textarea value={form.address} onChange={set("address")} rows={3} placeholder="خیابان، کوچه، پلاک و واحد..." className="w-full resize-none rounded-2xl border border-gold-500/15 bg-forest-950/60 px-4 py-3.5 text-sm leading-7 outline-none transition-colors placeholder:text-sage/50 focus:border-gold-500/50" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-sage">کد پستی (اختیاری)</label>
                    <input value={form.postalCode} onChange={set("postalCode")} placeholder="۱۰ رقم" dir="ltr" className={`${inputCls} text-right`} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold text-sage">یادداشت (اختیاری)</label>
                    <input value={form.note} onChange={set("note")} placeholder="مثلاً بسته‌بندی هدیه" className={inputCls} />
                  </div>
                </div>
                {error && <p className="mt-5 text-sm font-bold text-red-400">{error}</p>}
                <button
                  onClick={next}
                  className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gold-500 px-8 py-3.5 text-sm font-black text-forest-950 transition-colors hover:bg-gold-400"
                >
                  مرحله بعد
                  <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="rounded-3xl border border-gold-500/10 bg-forest-900/60 p-7 sm:p-9"
              >
                <h2 className="flex items-center gap-2.5 text-lg font-black">
                  <Lock size={19} className="text-gold-400" />
                  روش پرداخت
                </h2>
                <div className="mt-7 space-y-4">
                  {PAYMENTS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setPayment(m.key)}
                      className={`flex w-full items-center gap-4 rounded-2xl border p-5 text-start transition-all ${
                        payment === m.key
                          ? "border-gold-500/60 bg-gold-500/10"
                          : "border-gold-500/10 bg-forest-950/40 hover:border-gold-500/30"
                      }`}
                    >
                      <span
                        className={`grid size-12 shrink-0 place-items-center rounded-2xl ${
                          payment === m.key ? "bg-gold-500 text-forest-950" : "bg-forest-800 text-gold-400"
                        }`}
                      >
                        <m.icon size={21} strokeWidth={1.8} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-black">{m.label}</span>
                        <span className="mt-1 block text-xs text-sage">{m.desc}</span>
                      </span>
                      <span
                        className={`grid size-6 place-items-center rounded-full border transition-all ${
                          payment === m.key ? "border-gold-400 bg-gold-500 text-forest-950" : "border-forest-600"
                        }`}
                      >
                        {payment === m.key && <Check size={13} strokeWidth={3.5} />}
                      </span>
                    </button>
                  ))}
                </div>
                {error && <p className="mt-5 text-sm font-bold text-red-400">{error}</p>}
                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    onClick={next}
                    className="group inline-flex items-center gap-2 rounded-full bg-gold-500 px-8 py-3.5 text-sm font-black text-forest-950 transition-colors hover:bg-gold-400"
                  >
                    مرحله بعد
                    <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                  </button>
                  <button
                    onClick={() => setStep(0)}
                    className="inline-flex items-center gap-2 rounded-full border border-forest-600 px-6 py-3.5 text-sm font-bold text-sage transition-colors hover:text-cream"
                  >
                    <ArrowRight size={16} />
                    بازگشت
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.35 }}
                className="rounded-3xl border border-gold-500/10 bg-forest-900/60 p-7 sm:p-9"
              >
                <h2 className="flex items-center gap-2.5 text-lg font-black">
                  <CheckCircle2 size={19} className="text-gold-400" />
                  بازبینی نهایی
                </h2>
                <div className="mt-7 grid gap-4 rounded-2xl border border-gold-500/10 bg-forest-950/40 p-5 text-sm leading-7 sm:grid-cols-2">
                  <p>
                    <span className="text-sage">گیرنده: </span>
                    <span className="font-bold">{form.name}</span>
                  </p>
                  <p dir="ltr" className="sm:text-end">
                    <span className="font-bold">{form.phone}</span>
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-sage">آدرس: </span>
                    {form.city}، {form.address}
                  </p>
                  <p>
                    <span className="text-sage">روش پرداخت: </span>
                    <span className="font-bold">
                      {PAYMENTS.find((m) => m.key === payment)?.label}
                    </span>
                  </p>
                </div>
                {error && <p className="mt-5 text-sm font-bold text-red-400">{error}</p>}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    onClick={submitOrder}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-9 py-3.5 text-sm font-black text-forest-950 transition-colors hover:bg-gold-400 disabled:opacity-60"
                  >
                    {loading ? <Loader2 size={17} className="animate-spin" /> : <Truck size={17} />}
                    ثبت نهایی سفارش
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-2 rounded-full border border-forest-600 px-6 py-3.5 text-sm font-bold text-sage transition-colors hover:text-cream"
                  >
                    <ArrowRight size={16} />
                    بازگشت
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <aside>
          <div className="sticky top-28 rounded-3xl border border-gold-500/10 bg-forest-900/60 p-6">
            <h2 className="text-base font-black">خلاصه سفارش</h2>
            <ul className="mt-5 max-h-72 space-y-3 overflow-y-auto pe-1">
              {items.map((i) => (
                <li key={i.productId} className="flex items-center gap-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-gold-500/10">
                    <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold">{i.name}</span>
                    <span className="mt-1 block text-[11px] text-sage">
                      {faNum(i.qty)} × {faPrice(i.price)}
                    </span>
                  </span>
                  <span className="text-xs font-black text-gold-300">{faPrice(i.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-2.5 border-t border-gold-500/10 pt-5 text-sm">
              <div className="flex justify-between text-sage">
                <span>جمع کالاها</span>
                <span>{faPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sage">
                <span>هزینه ارسال</span>
                <span className={shipping === 0 ? "font-bold text-gold-300" : ""}>
                  {shipping === 0 ? "رایگان" : faPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between border-t border-gold-500/10 pt-3 text-base font-black">
                <span>مبلغ قابل پرداخت</span>
                <span className="text-gold-300">{faPrice(total)}</span>
              </div>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-sage">
              <Lock size={12} className="text-gold-500" />
              اطلاعات شما با رمزنگاری امن منتقل می‌شود.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
