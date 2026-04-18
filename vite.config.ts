import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import path from "node:path";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");

export default defineConfig({
  vite: {
    define: {
      "process.env.LOVABLE_API_KEY": JSON.stringify(env.LOVABLE_API_KEY ?? ""),
      "process.env.SUPABASE_URL": JSON.stringify(env.SUPABASE_URL ?? env.VITE_SUPABASE_URL ?? ""),
      "process.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(env.SUPABASE_PUBLISHABLE_KEY ?? env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ""),
      "process.env.SUPABASE_SERVICE_ROLE_KEY": JSON.stringify(env.SUPABASE_SERVICE_ROLE_KEY ?? ""),
    },
    resolve: {
      alias: {
        "entities/lib/decode.js": path.resolve(process.cwd(), "node_modules/entities/lib/decode.js"),
        "entities/lib/encode.js": path.resolve(process.cwd(), "node_modules/entities/lib/encode.js"),
        "entities": path.resolve(process.cwd(), "node_modules/entities"),
      },
    },
  },
});
