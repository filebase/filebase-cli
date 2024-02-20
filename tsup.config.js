import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.js"],
  splitting: false,
  sourcemap: false,
  noExternal: [
    "@filebase/sdk",
    "@inquirer/select",
    "blockstore-fs",
    "commander",
    "inquirer",
    "omelette",
    "recursive-fs",
    "tty-table",
  ],
  external: [],
  minify: true,
  minifyWhitespace: true,
  platform: "node",
  format: ["cjs"],
  clean: true,
});
