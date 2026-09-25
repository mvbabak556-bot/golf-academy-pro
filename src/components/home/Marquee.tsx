import { CircleDot } from "lucide-react";

const ITEMS = [
  "ارسال سریع به سراسر کشور",
  "ضمانت اصالت کالا",
  "مشاوره تخصصی گلف",
  "۷ روز مهلت بازگشت",
  "پرداخت امن",
  "بسته‌بندی هدیه رایگان",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-gold-500/15 bg-forest-900 py-4">
      <div dir="ltr" className="flex w-max animate-marquee items-center gap-8">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center gap-8">
            {row.map((t, i) => (
              <span
                key={`${half}-${i}`}
                className="flex items-center gap-8 whitespace-nowrap text-sm font-medium text-cream/70"
              >
                {t}
                <CircleDot size={11} className="text-gold-500" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
