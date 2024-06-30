// rollup.config.js 配置文件
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

export default {
  input: 'src/index',
  output: {
    dir: 'dist', // 输出文件路径
    // format: '', // 指定输出格式为 ES Module
    // sourcemap: true, // 生成 source maps
    preserveModules: true,
    preserveModulesRoot: 'src',
  },
  plugins: [resolve(), commonjs(), json()],
}
