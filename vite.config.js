import { resolve } from "path";
import { defineConfig } from "vite";
import fs from 'fs';
import path from 'path';

// Custom plugin to copy partials and images
function copyAssetsPlugin() {
  return {
    name: 'copy-assets',
    writeBundle() {
      // Copy partials
      const partialsSourceDir = path.resolve(__dirname, 'public/partials');
      const partialsDestDir = path.resolve(__dirname, 'dist/partials');

      // Create destination directory if it doesn't exist
      if (!fs.existsSync(partialsDestDir)) {
        fs.mkdirSync(partialsDestDir, { recursive: true });
        console.log(`Created directory: ${partialsDestDir}`);
      }

      // Copy all files from partials source to destination
      fs.readdirSync(partialsSourceDir).forEach(file => {
        const sourcePath = path.join(partialsSourceDir, file);
        const destPath = path.join(partialsDestDir, file);
        
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${sourcePath} to ${destPath}`);
      });
      
      // Copy images
      const imagesSourceDir = path.resolve(__dirname, 'public/images');
      const imagesDestDir = path.resolve(__dirname, 'dist/images');
      
      // Create images destination directory if it doesn't exist
      if (!fs.existsSync(imagesDestDir)) {
        fs.mkdirSync(imagesDestDir, { recursive: true });
        console.log(`Created directory: ${imagesDestDir}`);
      }
      
      // Copy all files from images source to destination
      fs.readdirSync(imagesSourceDir).forEach(file => {
        const sourcePath = path.join(imagesSourceDir, file);
        const destPath = path.join(imagesDestDir, file);
        
        fs.copyFileSync(sourcePath, destPath);
        console.log(`Copied ${sourcePath} to ${destPath}`);
      });
    }
  };
}

export default defineConfig({
  root: "src/",
  base: "/wdd330_final_project/",
  plugins: [copyAssetsPlugin()],

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
