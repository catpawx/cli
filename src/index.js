#! /usr/bin/env node
import chalk from 'chalk'
import { program } from 'commander'
import figlet from 'figlet'

import create from './order/create.js'

program
  .command('create [name]')
  .description('创建一个新项目（create a new project）')
  .option('-f, --force', '强制替换当前目录')
  .option('--umi', '使用umi模板')
  .option('--vite', '使用vite模板')
  .action((...arg) => {
    create(...arg)
  })

program.on('--help', () => {
  console.log(
    '\r\n' +
      figlet.textSync('seres', {
        font: 'Ghost',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true,
      }),
  )
  console.log(`\r\n ${chalk.cyan('联系我： hwj')}\r\n`)
})

program
  // .version(`v${require('../package.json').version}`)
  .version('v1.0.0')
  .usage('<command> [option]')

program.parse(process.argv)
