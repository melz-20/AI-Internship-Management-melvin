import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: {
    // Keep React's hook dispatcher singleton when dependencies are re-optimized.
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-chartjs-2", "chart.js"],
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
});
