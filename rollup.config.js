import typescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const noDeclarationFiles = { compilerOptions: { declaration: false } }

export default [
  // CommonJS
  {
    input: 'src/index.ts',
    output: { file: pkg.main, format: 'cjs' },
    plugins: [typescript({ useTsconfigDeclarationDir: true })],
  },
  // ES
  {
    input: 'src/index.ts',
    output: { file: pkg.module, format: 'es' },
    plugins: [typescript(noDeclarationFiles)],
  },
  // unpkg
  {
    input: 'src/index.ts',
    output: { file: pkg.unpkg, format: 'umd', name: 'Pollinator' },
    plugins: [
      typescript(noDeclarationFiles),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
    ],
  },
]
