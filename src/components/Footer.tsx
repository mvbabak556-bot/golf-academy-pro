import Link from "next/link";
import { Camera, Flag, Mail, MapPin, Phone, Send } from "lucide-react";
import { CATEGORIES } from "@/lib/data";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-gold-500/10 bg-forest-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-full border border-gold-500/40 bg-forest-800 text-gold-400">
                <Flag size={20} strokeWidth={1.8} />
              </span>
              <span className="font-display text-2xl italic text-cream">
                Putt<span className="text-gold-400">Club</span>
              </span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-7 text-sage">
              پات‌کلاب؛ مقصد اول گلف‌بازان ایران برای تجهیزات اورجینال. هر چوب و هر توپی که
              انتخاب می‌کنید، از دست تیم ما می‌گذرد تا در مسیر شما بی‌نقص باشد.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {[Camera, Send, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#contact"
                  aria-label="شبکه اجتماعی"
                  className="grid size-10 place-items-center rounded-full border border-forest-600/70 text-cream/70 transition-all hover:border-gold-400 hover:text-gold-300"
                >
                  <Icon size={17} strokeWidth={1.7} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-black tracking-wide text-gold-400">دسترسی سریع</h3>
            <ul className="mt-5 space-y-3 text-sm text-sage">
              {[
                { href: "/", label: "خانه" },
                { href: "/shop", label: "فروشگاه" },
                { href: "/#collections", label: "کالکشن‌ها" },
                { href: "/login", label: "ورود اعضا" },
                { href: "/panel", label: "پنل اعضا" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="transition-colors hover:text-gold-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-black tracking-wide text-gold-400">دسته‌بندی‌ها</h3>
            <ul className="mt-5 space-y-3 text-sm text-sage">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <Link
                    href={`/shop?cat=${encodeURIComponent(c)}`}
                    className="transition-colors hover:text-gold-300"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-black tracking-wide text-gold-400">تماس با ما</h3>
            <ul className="mt-5 space-y-4 text-sm text-sage">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-gold-500" />
                تهران، خیابان ولیعصر، برج گلف، طبقه ۱۲
              </li>
              <li className="flex items-center gap-3" dir="ltr">
                <Phone size={16} className="shrink-0 text-gold-500" />
                <span>۰۲۱ - ۸۸ ۷۷ ۶۶ ۵۵</span>
              </li>
              <li className="flex items-center gap-3" dir="ltr">
                <Mail size={16} className="shrink-0 text-gold-500" />
                <span>hello@puttclub.ir</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-gold-500/10 pt-7 text-xs text-sage sm:flex-row">
          <p>© ۱۴۰۴ پات‌کلاب — تمامی حقوق محفوظ است.</p>
          <p className="flex items-center gap-1.5">
            طراحی‌شده با
            <Flag size={13} className="text-gold-500" />
            برای گلف‌بازان ایران
          </p>
        </div>
      </div>
    </footer>
  );
}
