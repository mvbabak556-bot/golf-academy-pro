import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  real,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  name: text("name").notNull(),
  category: varchar("category", { length: 60 }).notNull(),
  price: integer("price").notNull(), // تومان
  oldPrice: integer("old_price"),
  shortDesc: text("short_desc").notNull(),
  description: text("description").notNull(),
  features: jsonb("features").$type<string[]>().notNull(),
  images: jsonb("images").$type<string[]>().notNull(),
  rating: real("rating").notNull().default(4.5),
  reviewCount: integer("review_count").notNull().default(0),
  stock: integer("stock").notNull().default(10),
  badge: varchar("badge", { length: 40 }),
  isNew: boolean("is_new").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id),
  author: text("author").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: text("email"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  postalCode: varchar("postal_code", { length: 20 }),
  note: text("note"),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull().default(0),
  total: integer("total").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("در حال پردازش"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
