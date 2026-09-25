import type { Metadata } from "next";
import { db } from "@/db";
import { products } from "@/db/schema";
import { toCardData, type ProductCardData } from "@/lib/types";
import ShopClient from "@/components/shop/ShopClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "فروشگاه | پات‌کلاب",
  description: "همه تجهیزات گلف پات‌کلاب — چوب، توپ، کیف، کفش، پوشاک و لوازم جانبی.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  let items: ProductCardData[] = [];
  try {
    const rows = await db.select().from(products);
    items = rows.map(toCardData);
  } catch {
    items = [];
  }
  return <ShopClient items={items} initialCat={cat ?? null} />;
}
