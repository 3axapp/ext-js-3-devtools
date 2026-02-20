import { build } from 'vite';

const watch = process.argv.includes('--watch') ? {} : null;

const entries = [
  ['background', 'src/background/background.ts'],
  ['backend', 'src/backend/backend.ts'],
  ['page', 'src/page/page.ts'],
];

await Promise.all(
  entries.map(([name, entry]) =>
    build({
      configFile: false,
      build: {
        outDir: 'dist',
        emptyOutDir: false,
        sourcemap: true,
        target: 'es2022',
        watch,
        rollupOptions: {
          input: { [name]: entry },
          output: {
            entryFileNames: '[name].js',
            format: 'iife',
          },
        },
      },
    }),
  ),
);
