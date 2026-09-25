import { sql } from "drizzle-orm";
import { db } from "./index";
import { products } from "./schema";
import { seedDatabase } from "./seed";

/**
 * Raw DDL kept in sync with `src/db/schema.ts` so the app can provision its own
 * tables in a fresh environment (no manual `drizzle-kit push` needed at runtime).
 */
const DDL = [
  `CREATE TABLE IF NOT EXISTS products (
    id serial PRIMARY KEY,
    slug varchar(140) NOT NULL UNIQUE,
    name text NOT NULL,
    category varchar(60) NOT NULL,
    price integer NOT NULL,
    old_price integer,
    short_desc text NOT NULL,
    description text NOT NULL,
    features jsonb NOT NULL,
    images jsonb NOT NULL,
    rating real NOT NULL DEFAULT 4.5,
    review_count integer NOT NULL DEFAULT 0,
    stock integer NOT NULL DEFAULT 10,
    badge varchar(40),
    is_new boolean NOT NULL DEFAULT false,
    is_featured boolean NOT NULL DEFAULT false,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id serial PRIMARY KEY,
    product_id integer NOT NULL REFERENCES products(id),
    author text NOT NULL,
    rating integer NOT NULL,
    comment text NOT NULL,
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id serial PRIMARY KEY,
    code varchar(20) NOT NULL UNIQUE,
    customer_name text NOT NULL,
    phone varchar(20) NOT NULL,
    email text,
    address text NOT NULL,
    city text NOT NULL,
    postal_code varchar(20),
    note text,
    items jsonb NOT NULL,
    subtotal integer NOT NULL,
    shipping integer NOT NULL DEFAULT 0,
    total integer NOT NULL,
    status varchar(30) NOT NULL DEFAULT 'در حال پردازش',
    created_at timestamp NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS users (
    id serial PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL UNIQUE,
    password text NOT NULL,
    phone varchar(20),
    created_at timestamp NOT NULL DEFAULT now()
  )`,
];

let done = false;

/**
 * Ensures tables exist and the demo catalogue is present.
 * Idempotent and never throws — a DB hiccup must not take the storefront down.
 */
export async function bootstrapDatabase(): Promise<void> {
  if (done) return;
  done = true;
  try {
    for (const statement of DDL) {
      await db.execute(sql.raw(statement));
    }
    const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(products);
    if (!row || row.n === 0) {
      await seedDatabase(false);
      console.log("[puttclub] demo catalogue seeded");
    }
  } catch (err) {
    console.warn("[puttclub] database bootstrap skipped:", (err as Error).message);
  }
}
