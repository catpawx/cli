import path from 'path'

import fs from 'fs-extra'
import inquirer from 'inquirer'

import { TemplateType } from '../enums/create.js'

/**
 * 获取模板值
 */
export async function getTemplate(options) {
  if (options?.vite) {
    return TemplateType.VITE
  }

  if (options?.umi) {
    return TemplateType.UMI
  }

  const opt = [
    {
      name: 'value',
      type: 'list',
      message: '请选择创建模板',
      choices: [
        { name: 'vite', value: TemplateType.VITE },
        { name: 'umi', value: TemplateType.UMI },
      ],
    },
  ]
  const result = await inquirer.prompt(opt)
  return result?.value
}

/**
 * 获取文件夹路径
 */
export async function getFilePath(name) {
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
export async function verifyFileName(options, filePath) {
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
