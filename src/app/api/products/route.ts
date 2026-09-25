import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const cat = new URL(req.url).searchParams.get("cat");
  try {
    const rows = cat
      ? await db.select().from(products).where(eq(products.category, cat))
      : await db.select().from(products);
    return NextResponse.json({ products: rows });
  } catch {
    return NextResponse.json({ products: [] });
  }
}
