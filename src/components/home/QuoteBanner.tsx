"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Quote } from "lucide-react";
import { Reveal } from "@/components/Motion";
import { STOCK } from "@/lib/data";

export default function QuoteBanner() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0 scale-125">
        <Image
          src={STOCK.fairway}
          alt="فرینج گلف در غروب"
          fill
          className="object-cover"
          sizes="100vw"
        />
      </motion.div>
      <div className="absolute inset-0 bg-forest-950/72" />

      <div className="relative mx-auto max-w-4xl px-4 py-32 text-center sm:px-6 sm:py-44">
        <Reveal>
          <span className="mx-auto grid size-14 place-items-center rounded-full border border-gold-500/40 bg-forest-950/50 text-gold-400 backdrop-blur">
            <Quote size={22} />
          </span>
          <blockquote className="mt-8 text-2xl font-black leading-[1.7] sm:text-4xl sm:leading-[1.7]">
            گلف بازیِ <span className="text-gold-grad">فرصت‌هاست</span>؛
            <br />
            هر ضربه، یک شروع تازه است.
          </blockquote>
          <p className="mt-6 text-sm font-medium tracking-widest text-cream/60">
            — تیم پات‌کلاب
          </p>
        </Reveal>
      </div>
    </section>
  );
}
