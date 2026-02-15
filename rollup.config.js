import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

export default {
  input: 'src/vertical-blinds-card.ts',
  output: {
    file: 'dist/vertical-blinds-card.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    resolve(),
    commonjs(),
    typescript(),
    json(),
    terser({
      compress: {
        passes: 2,
      },
    }),
  ],
};
