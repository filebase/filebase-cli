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
    "tty-table",
  ],
  external: [],
  dts: true,
  minify: true,
  format: ["cjs"],
  clean: true,
});
