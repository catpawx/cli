#! /usr/bin/env node
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { program } from 'commander'
// @ts-expect-error
import downloadGitRepo from 'download-git-repo'
import fs from 'fs-extra'
import inquirer from 'inquirer'
import ora from 'ora'
import path from 'path'

interface Options {
  force?: boolean
  ts?: boolean
  js?: boolean
}

// const config = {
//   // 可选择的框架
//   frameworks: ['ts', 'js'],
//   // 框架对应的仓库地址
//   frameworkUrls: {
//     ts: 'direct:https://github.com/catpawx/rollup-template.git#main',
//     js: 'direct:git@github.com:catpawx/rollup-template.git#main',
//   },
// }
const FRAMEWORKURLS = {
  ts: 'direct:https://github.com/catpawx/rollup-template.git#main',
  js: 'direct:git@github.com:catpawx/rollup-template.git#main',
} as const

program
  .command('create [name]')
  .description('创建一个新项目（create a new project）')
  .option('-f, --force', '强制替换当前目录')
  .option('--ts', '使用ts模板')
  .option('--js', '使用js模板')
  .action((...arg) => {
    console.log('🚀🚀🚀======>>>arg', arg)
    create(...arg)
  })

program.parse(process.argv)

/**
 * create 命令
 * @returns
 */
async function create(...arg: any[]) {
  const [name, options] = arg
  const templateVal = await getTemplate(options)

  const { path, shouldCreateFile } = await getFilePath(name)

  if (!shouldCreateFile) {
    const isCancel = await verifyFileName(options, path)
    if (isCancel) return
  }

  downloadFromGit({ templateVal, targetDir: path })
}

/**
 * 获取模板值
 */
export async function getTemplate(
  options: Options,
): Promise<keyof typeof FRAMEWORKURLS> {
  // options={'ts':true,'js':true} 找到手动录入的模板值与config中的模板值做比较
  let templateName
  Object.keys(FRAMEWORKURLS).forEach(template => {
    Object.keys(options).forEach(key => {
      if (key === template) {
        templateName = template
      }
    })
  })

  if (templateName) {
    return templateName
  }

  const opt = [
    {
      name: 'value',
      type: 'list',
      message: '请选择创建模板',
      choices: Object.keys(FRAMEWORKURLS),
    },
  ]
  const result = await inquirer.prompt(opt)
  return result?.value
}

/**
 * 获取文件夹路径
 */
export async function getFilePath(name: string) {
  const cwd = process.cwd()

  // 如果没有输入名称，手动录入
  if (!name) {
    // 是否在当前目录创建
    const shouldCreateFile = await inquirer.prompt([
      {
        name: 'value',
        type: 'list',
        message:
          '是否在当前目录直接生成？（如选择是，则直接生成，否则会在创建一个文件夹内生成）',
        choices: [
          { name: '是', value: 1 },
          { name: '否', value: 0 },
        ],
      },
    ])

    if (Number(shouldCreateFile?.value)) {
      return {
        path: cwd,
        shouldCreateFile: true,
      }
    } else {
      const fileName = await inquirer.prompt([
        {
          name: 'value',
          type: 'input',
          message: '您还没有输入项目名称，请输入：',
        },
      ])

      return {
        path: path.join(cwd, fileName?.value),
        shouldCreateFile: false,
      }
    }
  }

  return {
    path: path.join(cwd, name),
    shouldCreateFile: false,
  }
}

/**
 * 校验文件夹重名操作
 */
export async function verifyFileName(options: Options, filePath: string) {
  const isExist = fs.existsSync(filePath)
  if (!isExist) return false

  // 如果强制创建，则移除
  if (options.force) {
    await fs.remove(filePath)
    return true
  }

  const inquirerParams = [
    {
      name: 'value',
      type: 'list',
      message: '目标文件目录已经存在，请选择如下操作：',
      choices: [
        { name: '替换当前目录', value: 'replace' },
        { name: '取消当前操作', value: 'cancel' },
      ],
    },
  ]
  const inquirerData = await inquirer.prompt(inquirerParams)
  switch (inquirerData.value) {
    case 'replace':
      // 移除已存在的目录
      console.log('\r\n 移除中...')
      await fs.remove(filePath)
      console.log('\r\n 移除完成')
      break
    case 'cancel':
      console.log('\r 取消成功')
      return true
    default:
      return false
  }
}

/**
 * 从git拉取模板
 */
async function downloadFromGit({
  templateVal,
  targetDir,
}: {
  templateVal: keyof typeof FRAMEWORKURLS
  targetDir: any
}) {
  try {
    // 使用 ora 初始化，传入提示信息 message
    const spinner = ora('loading...')
    // 开始加载动画
    spinner.start()

    try {
      const result = await downloadGitRepo(
        FRAMEWORKURLS?.[templateVal],
        path.resolve(process.cwd(), targetDir),
        { clone: true },
        () => {},
      )
      spinner.succeed('下载成功 !!!')
      return Promise.resolve(result)
    } catch (error) {
      spinner.fail(`下载失败！请重试 ${error}`)
      return Promise.reject(error)
    }
  } catch (err) {
    console.log(err)
  }
}
