import { NextResponse } from "next/server";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, products, type OrderItem } from "@/db/schema";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email");
  if (!email) return NextResponse.json({ orders: [] });
  try {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.email, email))
      .orderBy(desc(orders.createdAt));
    return NextResponse.json({ orders: rows });
  } catch {
    return NextResponse.json({ orders: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const customer = body.customer ?? {};
    const items: { productId: number; qty: number }[] = body.items ?? [];

    if (!items.length) {
      return NextResponse.json({ error: "سبد خرید خالی است." }, { status: 400 });
    }
    if (!customer.name || !customer.phone || !customer.address || !customer.city) {
      return NextResponse.json({ error: "اطلاعات ارسال ناقص است." }, { status: 400 });
    }

    // Trust server-side prices
    const ids = items.map((i) => i.productId);
    const rows = await db.select().from(products).where(inArray(products.id, ids));
    const priced: OrderItem[] = items.map((i) => {
      const p = rows.find((r) => r.id === i.productId);
      return {
        productId: i.productId,
        name: p?.name ?? "کالا",
        price: p?.price ?? 0,
        qty: Math.max(1, i.qty),
        image: p?.images?.[0] ?? "",
      };
    });

    const subtotal = priced.reduce((s, i) => s + i.price * i.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const total = subtotal + shipping;
    const code = `PC-${Math.floor(100000 + Math.random() * 900000)}`;

    await db.insert(orders).values({
      code,
      customerName: customer.name,
      phone: customer.phone,
      email: customer.email || null,
      address: customer.address,
      city: customer.city,
      postalCode: customer.postalCode || null,
      note: customer.note || null,
      items: priced,
      subtotal,
      shipping,
      total,
    });

    return NextResponse.json({ ok: true, code, total });
  } catch {
    return NextResponse.json({ error: "خطای سرور در ثبت سفارش" }, { status: 500 });
  }
}
