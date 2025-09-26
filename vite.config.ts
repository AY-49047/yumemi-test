import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 例: リポジトリ名が my-react-app の場合
export default defineConfig({
  plugins: [react()],
  base: "yumemi-test",
  envDir: "config",
});
