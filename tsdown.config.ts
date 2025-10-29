import { defineConfig } from 'tsdown'

export default defineConfig({
  workspace: true,

  entry: ['./src/index.ts'],

  // Shared options
  format: ['es', 'cjs'],
  dts: true,
  unbundle: true,
  clean: true,
  sourcemap: true,
})