import { getFilePath, getTemplate, verifyFileName } from '../utils/create.js'
import Down from '../utils/down.js'

/**
 * create 命令
 * @returns
 */
export default async function create(...arg) {
  const [name, options] = arg
  const templateVal = await getTemplate(options)

  const { path, shouldCreateFile } = await getFilePath(name)

  if (!shouldCreateFile) {
    const isCancel = await verifyFileName(options, path)
    if (isCancel) return
  }

  const down = new Down(path, templateVal)
  await down.create()
}
