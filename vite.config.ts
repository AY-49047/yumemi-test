// vite.config.ts / vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 例: リポジトリが my-react-app の場合
export default defineConfig({
  base: "/yumemi-test/",
  plugins: [react()],
});
