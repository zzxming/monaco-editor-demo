import { copyFile } from 'node:fs/promises';
import { globSync } from 'glob';
import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    format: 'iife',
    platform: 'browser',
    ignoreWatch: ['docs'],
    entry: ['./src/*.ts'],
    noExternal: [],
    outputOptions: {
      name: 'bundle',
      format: 'iife',
      exports: 'named',
    },
    onSuccess() {
      const files = globSync('dist/*.iife.js');
      return Promise.all(
        files.map((file) => {
          const fileName = file.split(/[/\\]/).pop();
          return copyFile(file, `docs/${fileName}`);
        }),
      ) as unknown as Promise<void>;
    },
  },
  {
    format: 'es',
    entry: ['./src/*.ts'],
    ignoreWatch: ['docs'],
    noExternal: [],
  },
]);
