import { resolve } from "path";
import { defineConfig } from "vite";
import fs from 'fs';
import path from 'path';

// Custom plugin to copy partials
function copyPartialsPlugin() {
  return {
    name: 'copy-partials',
    writeBundle() {
      // Source partials directory (relative to where vite.config.js is)
      const sourceDir = path.resolve(__dirname, 'public/partials');
      // Destination directory (in the build output)
      const destDir = path.resolve(__dirname, 'dist/partials');

      // Create destination directory if it doesn't exist
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
        console.log(`Created directory: ${destDir}`);
      }

      // Copy all files from source to destination
      fs.readdirSync(sourceDir).forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const destPath = path.join(destDir, file);
        
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${sourcePath} to ${destPath}`);
      });
    }
  };
}

export default defineConfig({
  root: "src/",
  base: "/wdd330_final_project/",
  plugins: [copyPartialsPlugin()],

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
