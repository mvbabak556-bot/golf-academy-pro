"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Crown,
  Flag,
  Loader2,
  LogOut,
  Package,
  PackageOpen,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";
import { faDate, faNum, faPrice } from "@/lib/format";
import type { SessionUser } from "@/lib/types";

interface OrderView {
  id: number;
  code: string;
  total: number;
  status: string;
  createdAt: string;
  items: { productId: number; name: string; qty: number; image: string }[];
  city: string;
}

const STATUS_STYLE: Record<string, string> = {
  "در حال پردازش": "border-gold-500/40 bg-gold-500/10 text-gold-300",
  "ارسال شد": "border-sky-500/40 bg-sky-500/10 text-sky-300",
  "تحویل شد": "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "لغو شد": "border-red-500/40 bg-red-500/10 text-red-300",
};

export default function PanelPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("puttclub_user");
      if (!raw) {
        router.replace("/login");
        return;
      }
      const u = JSON.parse(raw) as SessionUser;
      setUser(u);
      fetch(`/api/orders?email=${encodeURIComponent(u.email)}`)
        .then((r) => r.json())
        .then((d) => setOrders(d.orders ?? []))
        .catch(() => setOrders([]))
        .finally(() => setLoading(false));
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const logout = () => {
    localStorage.removeItem("puttclub_user");
    router.push("/");
  };

  if (checking || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gold-400" />
      </div>
    );
  }

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[2.5rem] border border-gold-500/20 bg-gradient-to-l from-forest-800 via-forest-850 to-forest-900 p-8 sm:p-12"
      >
        <div aria-hidden className="absolute -top-20 -start-20 size-64 rounded-full bg-gold-500/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <span className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-2xl font-black text-forest-950 sm:size-20 sm:text-3xl">
              {user.name.charAt(0)}
            </span>
            <div>
              <p className="flex items-center gap-2 text-xs font-black tracking-widest text-gold-400">
                <Crown size={13} />
                پنل اعضا
              </p>
              <h1 className="mt-2 text-2xl font-black sm:text-3xl">سلام {user.name}!</h1>
              <p className="mt-1.5 text-sm text-sage" dir="ltr">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-forest-600 px-5 py-2.5 text-sm font-bold text-sage transition-colors hover:border-red-500/50 hover:text-red-300"
          >
            <LogOut size={15} />
            خروج
          </button>
        </div>

        <div className="relative mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { icon: Package, label: "سفارش‌ها", value: orders.length },
            { icon: Truck, label: "مجموع خرید", value: null, text: faPrice(totalSpent) },
            { icon: Flag, label: "سطح باشگاه", value: null, text: "طلایی" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-gold-500/10 bg-forest-950/50 p-4 text-center sm:p-5">
              <s.icon size={18} className="mx-auto text-gold-400" />
              <div className="mt-2 truncate text-base font-black text-gold-300 sm:text-lg">
                {s.value !== null ? faNum(s.value) : s.text}
              </div>
              <div className="mt-1 text-[11px] text-sage">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Orders */}
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2.5 text-xl font-black sm:text-2xl">
            <ShoppingBag size={20} className="text-gold-400" />
            سفارش‌های من
          </h2>
          <Link
            href="/shop"
            className="text-sm font-bold text-gold-300 transition-colors hover:text-gold-200"
          >
            + خرید جدید
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="animate-spin text-gold-400" />
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-6 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-gold-500/20 py-20 text-center">
            <PackageOpen size={42} className="text-gold-500/50" strokeWidth={1.4} />
            <p className="font-bold">هنوز سفارشی ثبت نکرده‌اید</p>
            <p className="max-w-xs text-sm leading-6 text-sage">
              اولین سفارش‌تان را ثبت کنید و تجربه خرید اورجینال را شروع کنید.
            </p>
            <Link
              href="/shop"
              className="mt-2 rounded-full bg-gold-500 px-7 py-3 text-sm font-black text-forest-950"
            >
              رفتن به فروشگاه
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <AnimatePresence initial={false}>
              {orders.map((o, i) => (
                <motion.article
                  key={o.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.5 }}
                  className="rounded-3xl border border-gold-500/10 bg-forest-900/60 p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-2xl bg-forest-800 text-gold-400">
                        <Package size={18} />
                      </span>
                      <div>
                        <div className="text-sm font-black tracking-widest" dir="ltr">
                          {o.code}
                        </div>
                        <div className="mt-1 text-[11px] text-sage">{faDate(o.createdAt)}</div>
                      </div>
                    </div>
                    <span
                      className={`rounded-full border px-3.5 py-1.5 text-[11px] font-black ${
                        STATUS_STYLE[o.status] ?? STATUS_STYLE["در حال پردازش"]
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {o.items.slice(0, 4).map((it) => (
                      <span
                        key={it.productId}
                        className="relative size-14 overflow-hidden rounded-xl border border-gold-500/10"
                        title={`${it.name} × ${faNum(it.qty)}`}
                      >
                        <Image src={it.image} alt={it.name} fill sizes="56px" className="object-cover" />
                      </span>
                    ))}
                    {o.items.length > 4 && (
                      <span className="text-xs text-sage">
                        +{faNum(o.items.length - 4)} کالای دیگر
                      </span>
                    )}
                    <span className="ms-auto text-sm font-black text-gold-300">
                      {faPrice(o.total)}
                    </span>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Account info */}
      <div className="mt-12 rounded-3xl border border-gold-500/10 bg-forest-900/60 p-7 sm:p-9">
        <h2 className="flex items-center gap-2.5 text-lg font-black">
          <User size={19} className="text-gold-400" />
          اطلاعات حساب
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border border-gold-500/10 bg-forest-950/40 p-4">
            <div className="text-[11px] text-sage">نام و نام خانوادگی</div>
            <div className="mt-1.5 text-sm font-bold">{user.name}</div>
          </div>
          <div className="rounded-2xl border border-gold-500/10 bg-forest-950/40 p-4">
            <div className="text-[11px] text-sage">ایمیل</div>
            <div className="mt-1.5 text-sm font-bold" dir="ltr">
              {user.email}
            </div>
          </div>
          <div className="rounded-2xl border border-gold-500/10 bg-forest-950/40 p-4">
            <div className="text-[11px] text-sage">شماره تماس</div>
            <div className="mt-1.5 text-sm font-bold" dir="ltr">
              {user.phone || "ثبت نشده"}
            </div>
          </div>
          <div className="rounded-2xl border border-gold-500/10 bg-forest-950/40 p-4">
            <div className="text-[11px] text-sage">مزایای باشگاه</div>
            <div className="mt-1.5 text-sm font-bold text-gold-300">ارسال رایگان سفارش‌های طلایی</div>
          </div>
        </div>
      </div>
    </div>
  );
}
