import { Star } from "lucide-react";

export default function Stars({
  value,
  size = 14,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.5}
          className={
            i <= Math.round(value) ? "fill-gold-400 text-gold-400" : "fill-transparent text-forest-600"
          }
        />
      ))}
    </span>
  );
}
