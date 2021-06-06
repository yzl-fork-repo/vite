import fs from 'fs'
import { ServerResponse } from 'http'
import * as execa from 'execa'

export function send(
  res: ServerResponse,
  source: string | Buffer,
  mime: string
) {
  res.setHeader('Content-Type', mime)
  res.end(source)
}

export function sendJS(res: ServerResponse, source: string | Buffer) {
  send(res, source, 'application/javascript')
}

export function sendJSStream(res: ServerResponse, filename: string) {
  res.setHeader('Content-Type', 'application/javascript')
  const stream = fs.createReadStream(filename)
  stream.on('open', () => {
    stream.pipe(res)
  })
  stream.on('error', (err) => {
    res.end(err)
  })
}


export function runCommand(command: string, args?: string[], path?: string) {
  let p = path
  if (!p) {
    p = process.cwd()
  }
  if (!args) {
    // \s 匹配任何空白字符，包括空格、制表符、换页符
    [command, ...args] = command.split(/\s+/)
  }

  return execa.sync(
    command,
    args,
    {
      cwd: p,
      stdio: 'inherit'
    }
  )
}
