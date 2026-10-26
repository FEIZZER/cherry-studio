import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'built-in/plugins/index': 'src/core/plugins/built-in/index.ts',
    'provider/index': 'src/core/providers/index.ts'
  },
  outDir: 'dist',
  format: ['esm', 'cjs'],
  clean: true,
  // Declaration maps let editors jump from `dist/*.d.mts` straight to `src/*.ts`.
  dts: { sourcemap: true },
  tsconfig: 'tsconfig.json'
})
