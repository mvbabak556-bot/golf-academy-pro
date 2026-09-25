import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "ایمیل و رمز عبور الزامی است." }, { status: 400 });
    }
    const [user] = await db.select().from(users).where(eq(users.email, String(email).toLowerCase()));
    if (!user || user.password !== sha(String(password))) {
      return NextResponse.json({ error: "ایمیل یا رمز عبور اشتباه است." }, { status: 401 });
    }
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
