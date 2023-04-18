import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import {
  AndDesignVueResolve,
  AntdResolve,
  ElementPlusResolve,
  NutuiResolve,
  VantResolve,
  createStyleImportPlugin,
} from "vite-plugin-style-import";
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
    }),
    createStyleImportPlugin({
      resolves: [
        AndDesignVueResolve(),
        VantResolve(),
        ElementPlusResolve(),
        NutuiResolve(),
        AntdResolve(),
      ],
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
      external: ["react", "react-dom", "styled-components"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
