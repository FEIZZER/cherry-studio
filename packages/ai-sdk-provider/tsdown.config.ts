import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts'
  },
  outDir: 'dist',
  format: ['esm', 'cjs'],
  clean: true,
  // Declaration maps let editors jump from `dist/*.d.mts` straight to `src/*.ts`.
  dts: { sourcemap: true },
  tsconfig: 'tsconfig.json'
})
