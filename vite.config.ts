import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), 
      "~": path.resolve(__dirname, "public"), 
    },
  },
})
