import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative base so the built assets resolve correctly whether the app is
  // served from the domain root (Vercel) or a GitHub Pages project path
  // (https://<user>.github.io/education-strategy-quiz/).
  base: "./",
});
