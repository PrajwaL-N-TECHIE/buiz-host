import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5175,
  },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-firebase": ["firebase/app", "firebase/firestore", "firebase/auth"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-motion": ["framer-motion"],
          "vendor-pdf": ["jspdf"],
        },
      },
    },
  },
});
