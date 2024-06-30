import chalk from 'chalk'
import downloadGitRepo from 'download-git-repo'
import ora from 'ora'
import path from 'path'
import util from 'util'

import config from '../config/config.js'

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message)
  // 开始加载动画
  spinner.start()

  try {
    const result = await fn(...args)
    spinner.succeed('下载成功 !!!')
    return Promise.resolve(result)
  } catch (error) {
    spinner.fail(`下载失败！请重试 ${error}`)
    return Promise.reject(error)
  }
}

/**
 * 从git拉取模板
 */

class Down {
  constructor(filePath, templateVal) {
    this.templateVal = templateVal
    this.targetDir = filePath
    this.downloadGitRepo = util.promisify(downloadGitRepo)
  }

  async download() {
    return await wrapLoading(
      this.downloadGitRepo,
      'loading...',
      config.frameworkUrls?.[this.templateVal],
      path.resolve(process.cwd(), this.targetDir),
      { clone: true },
    )
  }

  async create() {
    try {
      await this.download()
      console.log(
        `\r\n 成功创建项目，祝您生活愉快： ${chalk.cyan(this.templateVal)}`,
      )
    } catch (err) {
      console.log(err)
    }
  }
}

export default Down
