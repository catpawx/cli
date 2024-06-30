#! /usr/bin/env node
import { program } from 'commander'

import create from './order/create.js'
program
  .command('create [name]')
  .description('创建一个新项目（create a new project）')
  .option('-f, --force', '强制替换当前目录')
  .option('--ts', '使用ts模板')
  .option('--js', '使用js模板')
  .action((...arg) => {
    create(...arg)
  })

program.parse(process.argv)
