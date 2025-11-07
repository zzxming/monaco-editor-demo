import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    format: 'iife',
    platform: 'browser',
    entry: ['./src/*.ts'],
    noExternal: [],
    outputOptions: {
      name: 'bundle',
      format: 'iife',
      exports: 'named',
    },
  },
  {
    format: 'es',
    entry: ['./src/*.ts'],
    noExternal: [],
  },
]);
