import { bootstrapDatabase } from "@/db/bootstrap";

/**
 * Node.js-only boot hook: provisions tables and seeds the demo catalogue
 * when the database is empty, so the storefront is always open for business.
 */
await bootstrapDatabase();
