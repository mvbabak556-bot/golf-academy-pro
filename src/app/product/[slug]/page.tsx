import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";
import { ChevronLeft } from "lucide-react";
import { db } from "@/db";
import { products, reviews } from "@/db/schema";
import { toCardData, toReviewData } from "@/lib/types";
import ProductView from "@/components/product/ProductView";
import ReviewsSection from "@/components/product/ReviewsSection";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

async function getData(slug: string) {
  try {
    const [p] = await db.select().from(products).where(eq(products.slug, slug));
    if (!p) return null;
    const revs = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, p.id))
      .orderBy(desc(reviews.createdAt));
    const related = await db
      .select()
      .from(products)
      .where(and(eq(products.category, p.category), ne(products.id, p.id)))
      .limit(3);
    return { p, revs, related };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getData(slug);
  return { title: data ? `${data.p.name} | پات‌کلاب` : "پات‌کلاب" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getData(slug);
  if (!data) notFound();

  const { p, revs, related } = data;
  const productData = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    price: p.price,
    oldPrice: p.oldPrice,
    shortDesc: p.shortDesc,
    description: p.description,
    features: p.features,
    images: p.images,
    rating: p.rating,
    reviewCount: p.reviewCount,
    stock: p.stock,
    badge: p.badge,
    isNew: p.isNew,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-28 pt-28 sm:px-6 sm:pt-36 lg:px-8">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 text-xs text-sage">
        <Link href="/" className="transition-colors hover:text-gold-300">
          خانه
        </Link>
        <ChevronLeft size={12} />
        <Link href="/shop" className="transition-colors hover:text-gold-300">
          فروشگاه
        </Link>
        <ChevronLeft size={12} />
        <Link
          href={`/shop?cat=${encodeURIComponent(p.category)}`}
          className="transition-colors hover:text-gold-300"
        >
          {p.category}
        </Link>
        <ChevronLeft size={12} />
        <span className="text-gold-300">{p.name}</span>
      </nav>

      <ProductView product={productData} />

      <ReviewsSection
        productId={p.id}
        rating={p.rating}
        reviewCount={p.reviewCount}
        initialReviews={revs.map(toReviewData)}
      />

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="text-2xl font-black sm:text-3xl">
            محصولات <span className="text-gold-grad">مرتبط</span>
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <ProductCard key={r.id} p={toCardData(r)} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
