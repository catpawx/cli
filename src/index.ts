import fs from 'node:fs'
import path from 'node:path'

import downloadGitRepo from 'download-git-repo'
// import { fileURLToPath } from 'node:url'
// import spawn from 'cross-spawn'
import minimist from 'minimist'
import ora from 'ora'
import colors from 'picocolors'
import prompts from 'prompts'
const {
  blue,
  blueBright,
  cyan,
  green,
  // greenBright,
  magenta,
  red,
  redBright,
  reset,
  yellow,
} = colors

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
Usage: create-vite [OPTION]... [DIRECTORY]

Create a new Vite project in JavaScript or TypeScript.
With no arguments, start the CLI in interactive mode.

Options:
  -t, --template NAME        use a specific template

Available templates:
${yellow    ('vanilla-ts     vanilla'  )}
${green     ('vue-ts         vue'      )}
${cyan      ('react-ts       react'    )}
${cyan      ('react-swc-ts   react-swc')}
${magenta   ('preact-ts      preact'   )}
${redBright ('lit-ts         lit'      )}
${red       ('svelte-ts      svelte'   )}
${blue      ('solid-ts       solid'    )}
${blueBright('qwik-ts        qwik'     )}`

type ColorFunc = (str: string | number) => string

type Framework = {
  name: string
  display: string
  color: ColorFunc
  // variants: FrameworkVariant[]
  url: string
}
// type FrameworkVariant = {
//   name: string
//   display: string
//   color: ColorFunc
//   customCommand?: string
// }

const FRAMEWORKS: Framework[] = [
  {
    name: 'rollup-template',
    display: 'Rollup-template',
    color: yellow,
    url: 'direct:https://github.com/catpawx/rollup-template.git#main',
    // variants: [
    //   {
    //     name: 'vanilla-ts',
    //     display: 'TypeScript',
    //     color: blue,
    //   },
    //   {
    //     name: 'vanilla',
    //     display: 'JavaScript',
    //     color: yellow,
    //   },
    // ],
  },
]

const TEMPLATES = FRAMEWORKS.map(framework => framework.name)

const defaultTargetDir = 'test'

/** 程序入口 */
async function init() {
  console.log('🚀🚀🚀======>>>111')
  const argTargetDir = formatTargetDir(argv._[0])
  console.log('🚀🚀🚀======>>>argTargetDir', argTargetDir)
  const argTemplate = argv.template || argv.t
  console.log('🚀🚀🚀======>>>argTemplate', argTemplate)
  const help = argv.help
  if (help) {
    console.log(helpMessage)
  }

  let targetDir = argTargetDir || defaultTargetDir
  console.log('🚀🚀🚀======>>>targetDir', targetDir)

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
          message: reset('Project name:'),
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
            (targetDir === '.'
              ? 'Current directory'
              : `Target directory "${targetDir}"`) +
            ' is not empty. Please choose how to proceed:',
          initial: 0,
          choices: [
            {
              title: 'Cancel operation',
              value: 'no',
            },
            {
              title: 'Remove existing files and continue',
              value: 'yes',
            },
            {
              title: 'Ignore files and continue',
              value: 'ignore',
            },
          ],
        },
        {
          type: (_, { overwrite }: { overwrite?: string }) => {
            if (overwrite === 'no') {
              throw new Error(red('✖') + ' Operation cancelled')
            }
            return null
          },
          name: 'overwriteChecker',
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
          name: 'packageName',
          message: reset('Package name:'),
          initial: () => toValidPackageName(getProjectName()),
          validate: dir =>
            isValidPackageName(dir) || 'Invalid package.json name',
        },
        {
          type:
            argTemplate && TEMPLATES.includes(argTemplate) ? null : 'select',
          name: 'framework',
          message:
            typeof argTemplate === 'string' && !TEMPLATES.includes(argTemplate)
              ? reset(
                  `"${argTemplate}" isn't a valid template. Please choose from below: `,
                )
              : reset('Select a framework:'),
          initial: 0,
          choices: FRAMEWORKS.map(framework => {
            const frameworkColor = framework.color
            return {
              title: frameworkColor(framework.display || framework.name),
              value: framework,
            }
          }),
        },
        // {
        //   type: (framework: Framework | /* package name */ string) =>
        //     typeof framework === 'object' ? 'select' : null,
        //   name: 'variant',
        //   message: reset('Select a variant:'),
        //   choices: (framework: Framework) =>
        //     framework.variants.map(variant => {
        //       const variantColor = variant.color
        //       return {
        //         title: variantColor(variant.display || variant.name),
        //         value: variant.name,
        //       }
        //     }),
        // },
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled')
        },
      },
    )
    const { framework, overwrite, packageName } = result
    console.log('🚀🚀🚀======>>>result', framework, overwrite, packageName)

    const root = path.join(cwd, targetDir)

    if (overwrite === 'yes') {
      emptyDir(root)
    } else if (!fs.existsSync(root)) {
      fs.mkdirSync(root, { recursive: true })
    }

    // determine template
    const template: string = framework?.name || argTemplate

    downloadFromGit(
      FRAMEWORKS.find(framework => framework.name === template)!.url,
      root,
    )
  } catch (cancelled: any) {
    console.log(cancelled.message)
  }
}

/**
 * 从git拉取模板
 */
async function downloadFromGit(url: string, dest: string) {
  try {
    // 使用 ora 初始化，传入提示信息 message
    const spinner = ora('loading...')
    // 开始加载动画
    spinner.start()

    try {
      const result = await downloadGitRepo(url, dest, { clone: true }, () => {})
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

function formatTargetDir(targetDir: string | undefined) {
  return targetDir?.trim().replace(/\/+$/g, '')
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
