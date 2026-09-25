import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";

export const dynamic = "force-dynamic";

const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password || String(password).length < 6) {
      return NextResponse.json(
        { error: "همه فیلدها الزامی است و رمز عبور حداقل ۶ کاراکتر باشد." },
        { status: 400 }
      );
    }
    const normalized = String(email).toLowerCase().trim();
    const [existing] = await db.select().from(users).where(eq(users.email, normalized));
    if (existing) {
      return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده است." }, { status: 409 });
    }
    const [user] = await db
      .insert(users)
      .values({ name, email: normalized, password: sha(String(password)) })
      .returning();
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch {
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
