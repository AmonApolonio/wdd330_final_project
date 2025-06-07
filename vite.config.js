import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",
  base: "/wdd330_final_project/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        apiTest: resolve(__dirname, "src/api-test.html"),
      },
    },
  },
});
