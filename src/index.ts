#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

import downloadGitRepo from 'download-git-repo'
import minimist from 'minimist'
import ora from 'ora'
import colors from 'picocolors'
import prompts from 'prompts'
import util from 'util'
const { red, reset, yellow, magenta } = colors

const argv = minimist<{
  template?: string
  help?: boolean
}>(process.argv.slice(2), {
  default: { help: false },
  alias: { h: 'help', t: 'template' },
  string: ['_'],
})

const cwd = process.cwd()

// prettier-ignore
const helpMessage = `\
Usage: cpx [OPTION]... [DIRECTORY]

创建一个新的JavaScript或TypeScript项目.
无参数时，以交互模式启动CLI.

选项:
  -t, --template NAME        使用特定的模板

可用模板:
${yellow    ('rollup-template-ts     rollup-template'  )}
${magenta    ('cli-template-ts     cli-template'  )}
`

type ColorFunc = (str: string | number) => string

type Framework = {
  name: string
  display: string
  color: ColorFunc
  url: string
}

const FRAMEWORKS: Framework[] = [
  {
    name: 'rollup-template',
    display: 'Rollup-Template',
    color: yellow,
    url: 'direct:https://github.com/catpawx/rollup-template.git#main',
  },
  {
    name: 'cli-template',
    display: 'Cli-Template',
    color: magenta,
    url: 'direct:https://github.com/catpawx/cli-template.git#main',
  },
]

const TEMPLATES = FRAMEWORKS.map(framework => framework.name)

const defaultTargetDir = 'catpawx'

/** 程序入口 */
async function init() {
  const argTargetDir = formatTargetDir(argv._[0])
  const argTemplate = argv.template || argv.t
  const help = argv.help
  if (help) {
    console.log(helpMessage)
  }

  let targetDir = argTargetDir || defaultTargetDir

  const getProjectName = () => path.basename(path.resolve(targetDir))

  let result: prompts.Answers<
    'projectName' | 'overwrite' | 'packageName' | 'framework'
  >

  prompts.override({
    overwrite: argv.overwrite,
  })

  try {
    result = await prompts(
      [
        {
          type: argTargetDir ? null : 'text',
          name: 'projectName',
          message: reset('项目名称:'),
          initial: defaultTargetDir,
          onState: state => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir
          },
        },
        {
          type: () =>
            !fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'select',
          name: 'overwrite',
          message: () =>
            (targetDir === '.' ? '当前目录' : `目标目录 "${targetDir}"`) +
            ' 内容不为空。请选择如何继续。:',
          initial: 0,
          choices: [
            {
              title: '取消操作',
              value: 'no',
            },
            {
              title: '删除现有文件并继续',
              value: 'yes',
            },
            {
              title: '忽略文件并继续',
              value: 'ignore',
            },
          ],
        },
        {
          type: (_, { overwrite }: { overwrite?: string }) => {
            if (overwrite === 'no') {
              throw new Error(red('✖') + ' 操作已取消')
            }
            return null
          },
          name: 'overwriteChecker',
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
          name: 'packageName',
          message: reset('包名(package.json name):'),
          initial: () => toValidPackageName(getProjectName()),
          validate: dir => isValidPackageName(dir) || '无效的package.json名称',
        },
        {
          type:
            argTemplate && TEMPLATES.includes(argTemplate) ? null : 'select',
          name: 'framework',
          message:
            typeof argTemplate === 'string' && !TEMPLATES.includes(argTemplate)
              ? reset(`"${argTemplate}" 不是一个有效的模板。请从以下选择: `)
              : reset('选择一个框架:'),
          initial: 0,
          choices: FRAMEWORKS.map(framework => {
            const frameworkColor = framework.color
            return {
              title: frameworkColor(framework.display || framework.name),
              value: framework,
            }
          }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' 操作已取消')
        },
      },
    )
    const { framework, overwrite, packageName } = result

    // 最终目录
    const root = path.join(cwd, targetDir)
    if (overwrite === 'yes') {
      emptyDir(root)
    } else if (!fs.existsSync(root)) {
      fs.mkdirSync(root, { recursive: true })
    }

    // 临时目录
    const templateDir = path.join(root, `.temp-${targetDir}`)
    // 如果存在临时目录，清空
    if (fs.existsSync(templateDir)) {
      emptyDir(templateDir)
    } else {
      fs.mkdirSync(templateDir, { recursive: true })
    }

    // 确定模板
    const template: string = framework?.name || argTemplate

    // 下载模板
    await download(
      FRAMEWORKS.find(framework => framework.name === template)!.url,
      templateDir,
    )

    // 复制临时目录->目标目录，修改package.json
    const write = (file: string, content?: string) => {
      const targetPath = path.join(root, file)
      if (content) {
        fs.writeFileSync(targetPath, content)
      } else {
        copy(path.join(templateDir, file), targetPath)
      }
    }

    const files = fs.readdirSync(templateDir)
    for (const file of files.filter(f => f !== 'package.json')) {
      write(file)
    }

    const pkg = JSON.parse(
      fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8'),
    )

    pkg.name = packageName || getProjectName()

    write('package.json', JSON.stringify(pkg, null, 2) + '\n')

    fs.rmSync(templateDir, { recursive: true })
  } catch (cancelled: any) {
    console.log(cancelled.message)
  }
}

/**
 * 从git拉取模板
 */
async function download(url: string, dest: string) {
  const spinner = ora('下载中...')
  spinner.start()
  try {
    const downloadGitRepoPromisify = util.promisify(downloadGitRepo)
    const result = await downloadGitRepoPromisify(url, dest, { clone: true })
    spinner.succeed('下载成功 !!!')
    return Promise.resolve(result)
  } catch (error) {
    spinner.fail(`下载失败！请重试 ${error}`)
    fs.rmSync(dest, { recursive: true })
    return Promise.reject(error)
  }
}

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, '')
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

function isEmpty(path: string) {
  const files = fs.readdirSync(path)
  return files.length === 0 || (files.length === 1 && files[0] === '.git')
}

function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') {
      continue
    }
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true })
  }
}

function isValidPackageName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  )
}

function toValidPackageName(projectName: string) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-')
}

init().catch(e => {
  console.error(e)
})
