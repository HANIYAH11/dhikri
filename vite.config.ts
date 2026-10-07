import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" حتى يعمل البناء من أي مسار (استضافة ثابتة أو مجلد محلي)
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: "es2018",
    assetsInlineLimit: 4096,
    sourcemap: false,
  },
});
