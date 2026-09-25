import type { products, reviews } from "@/db/schema";

export type ProductRow = typeof products.$inferSelect;
export type ReviewRow = typeof reviews.$inferSelect;

export interface ProductCardData {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  image: string;
  rating: number;
  reviewCount: number;
  stock: number;
  badge: string | null;
  isNew: boolean;
}

export interface ReviewData {
  id: number;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}

export function toCardData(r: ProductRow): ProductCardData {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category,
    price: r.price,
    oldPrice: r.oldPrice,
    image: r.images[0],
    rating: r.rating,
    reviewCount: r.reviewCount,
    stock: r.stock,
    badge: r.badge,
    isNew: r.isNew,
  };
}

export function toReviewData(r: ReviewRow): ReviewData {
  return {
    id: r.id,
    author: r.author,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  };
}
