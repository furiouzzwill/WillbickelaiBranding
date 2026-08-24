import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolves the "@/*" alias from tsconfig.json natively — no plugin needed.
    tsconfigPaths: true,
    alias: {
      /*
       * `server-only` throws on import unless the bundler resolves it under
       * React's "react-server" condition, which Vitest's Node environment does
       * not set. Point it at the package's own no-op build so server modules
       * stay testable — the guard still applies to the real Next.js build,
       * which is where it matters.
       */
      "server-only": fileURLToPath(
        new URL("./node_modules/server-only/empty.js", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: false,
  },
});
