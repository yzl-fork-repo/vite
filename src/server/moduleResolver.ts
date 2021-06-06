import path from 'path'
import { runCommand, sendJSStream } from './utils'
import { ServerResponse } from 'http'

const moduleNameToCachePathMap = new Map()

export function resolveModule(id: string, cwd: string, res: ServerResponse) {
  let modulePath: string

  // fallback to node resolve
  try {
    const isScopedModule = id.startsWith('@')
    const tmp = id.split('/')
    const moduleBaseName = tmp.slice(0, isScopedModule ? 2 : 1).join('/')

    if (!moduleNameToCachePathMap.has(moduleBaseName)) {
      const target = path.resolve(process.cwd(), '.cache', `${moduleBaseName}.js`)
      runCommand('esbuild', [
        moduleBaseName,
        '--bundle',
        '--format=esm',
        `--outfile=${target}`
      ])

      modulePath = target
      moduleNameToCachePathMap.set(moduleBaseName, target)
    } else {
      modulePath = moduleNameToCachePathMap.get(moduleBaseName)
    }

    sendJSStream(res, modulePath)
  } catch (e) {
    console.error(e)
    res.statusCode = 404
    res.end()
  }
}
