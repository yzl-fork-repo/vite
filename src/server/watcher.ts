import chokidar from 'chokidar'

export interface ServerNotification {
  type: string
  path?: string
  id?: string
  index?: number
}

export function createFileWatcher(
  cwd: string,
  notify: (payload: ServerNotification) => void
) {
  const fileWatcher = chokidar.watch(cwd, {
    ignored: [/node_modules/]
  })

  fileWatcher.on('change', async (file) => {
    const send = (payload: ServerNotification) => {
      console.log(`[hmr] ${JSON.stringify(payload)}`)
      notify(payload)
    }

    send({
      type: 'full-reload'
    })
  })
}
