import path from 'path'
import { runCommand, sendJSStream } from './utils'
import { ServerResponse } from 'http'

// const fileToIdMap = new Map()
const moduleNameToCachePathMap = new Map()

export function resolveModule(id: string, cwd: string, res: ServerResponse) {
  let modulePath: string
  // let sourceMapPath: string | undefined = undefined
  // // TODO support custom imports map e.g. for snowpack web_modules
  //
  // if (id.endsWith('.map')) {
  //   sourceMapPath = id
  //   id = fileToIdMap.get(id.replace(/\.map$/, ''))
  //   if (!id) {
  //     res.statusCode = 404
  //     res.end()
  //     return
  //   }
  // }

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

    // modulePath = resolve(cwd, `${id}/package.json`)
    //
    // // module resolved, try to locate its "module" entry
    // const pkg = require(modulePath)
    // modulePath = path.join(path.dirname(modulePath), pkg.module || pkg.main)
    // fileToIdMap.set(path.basename(modulePath), id)
    // // this is a source map request.
    // if (sourceMapPath) {
    //   modulePath = path.join(path.dirname(modulePath), sourceMapPath)
    // }

    sendJSStream(res, modulePath)
  } catch (e) {
    console.error(e)
    res.statusCode = 404
    res.end()
  }
}
