import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { toCardData, type ProductCardData } from "@/lib/types";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import Collections from "@/components/home/Collections";
import Featured from "@/components/home/Featured";
import QuoteBanner from "@/components/home/QuoteBanner";
import FeaturesStrip from "@/components/home/FeaturesStrip";
import Testimonials from "@/components/home/Testimonials";
import CtaBanner from "@/components/home/CtaBanner";

export const dynamic = "force-dynamic";

async function getFeatured(): Promise<ProductCardData[]> {
  try {
    const featured = await db
      .select()
      .from(products)
      .where(eq(products.isFeatured, true))
      .limit(4);
    if (featured.length > 0) return featured.map(toCardData);
    const latest = await db.select().from(products).orderBy(desc(products.id)).limit(4);
    return latest.map(toCardData);
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeatured();

  return (
    <>
      <Hero />
      <Marquee />
      <Collections />
      <Featured items={featured} />
      <QuoteBanner />
      <FeaturesStrip />
      <Testimonials />
      <CtaBanner />
    </>
  );
}
