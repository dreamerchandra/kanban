import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import {
  ElementPlusResolve,
  createStyleImportPlugin,
} from "vite-plugin-style-import";

export default defineConfig({
  optimizeDeps: {
    exclude: ["react", "react-dom"],
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
    createStyleImportPlugin({
      resolves: [ElementPlusResolve()],
    }),
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/Kanban/index.tsx"),
      name: "Kanban",
      formats: ["es", "umd"],
      fileName: (format) => `kanban.${format}.js`,
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
