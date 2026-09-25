import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const productId = Number(new URL(req.url).searchParams.get("productId"));
  if (!productId) return NextResponse.json({ reviews: [] });
  try {
    const rows = await db.select().from(reviews).where(eq(reviews.productId, productId));
    return NextResponse.json({ reviews: rows });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const productId = Number(body.productId);
    const author = String(body.author ?? "").trim();
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5));
    const comment = String(body.comment ?? "").trim();

    if (!productId || author.length < 2 || comment.length < 5) {
      return NextResponse.json({ error: "داده‌های ورودی نامعتبر است." }, { status: 400 });
    }

    const [review] = await db
      .insert(reviews)
      .values({ productId, author, rating, comment })
      .returning();

    // Recompute product rating
    const all = await db.select().from(reviews).where(eq(reviews.productId, productId));
    const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
    await db
      .update(products)
      .set({ rating: Math.round(avg * 10) / 10, reviewCount: all.length })
      .where(eq(products.id, productId));

    return NextResponse.json({
      review: { ...review, createdAt: review.createdAt.toISOString() },
      rating: Math.round(avg * 10) / 10,
      reviewCount: all.length,
    });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
