/**
 * CLI entrypoint: `npx tsx src/db/seed-cli.ts`
 * Kept separate from `seed.ts` so the seedable module stays free of
 * Node-only globals (process.argv / process.exit) when bundled by Next.js.
 */
import "dotenv/config";
import { seedDatabase } from "./seed";

seedDatabase(true)
  .then((count) => {
    console.log(`Done — ${count} products.`);
    process.exit(0);
  })
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  });
