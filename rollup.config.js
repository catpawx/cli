// rollup.config.js 配置文件
import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'src/index.ts',
  output: {
    dir: 'dist', // 输出文件路径
    format: 'es', // 指定输出格式为 ES Module
    sourcemap: true, // 生成 source maps
    preserveModules: true,
    preserveModulesRoot: 'src',
  },
  plugins: [typescript({ tsconfig: './tsconfig.json' }), resolve(), commonjs()],
}
