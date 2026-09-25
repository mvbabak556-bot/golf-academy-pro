/**
 * Runs once when the Next.js server boots.
 * Node-only work is dynamically imported so this file stays Edge-safe.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation-node");
  }
}
