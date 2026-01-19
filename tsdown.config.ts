import { copyFile } from 'node:fs/promises';
import { sep } from 'node:path';
import { globSync } from 'glob';
import { defineConfig } from 'tsdown';

// 为每个文件单独生成 IIFE 配置
const tsFiles = globSync('src/*.ts');

// 通用配置
const baseConfig = {
  platform: 'browser' as const,
  ignoreWatch: ['docs'],
  noExternal: [],
  outputOptions: {
    name: 'bundle',
    format: 'iife' as const,
    exports: 'named' as const,
  },
};

const iifeConfigs = tsFiles.map(file => ({
  ...baseConfig,
  format: 'iife' as const,
  entry: [file.replaceAll(sep, '/')],
  onSuccess() {
    const fileName = file.split(/[/\\]/).pop()?.replace('.ts', '.iife.js');
    if (fileName) {
      return copyFile(`dist/${fileName}`, `docs/${fileName}`) as unknown as Promise<void>;
    }
  },
}));

const esConfig = {
  format: 'es' as const,
  entry: ['./src/*.ts'],
  ignoreWatch: ['docs'],
  noExternal: [],
};

export default defineConfig([...iifeConfigs, esConfig]);
