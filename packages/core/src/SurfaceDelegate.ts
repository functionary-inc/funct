import { DebouncedFunc } from 'lodash'

export interface ISurfaceDelegate {
  get: (key: string) => string | null
  set: (key: string, value: string) => void
  remove: (key: string) => void
  clear: () => void
  addFlushListeners: (flush: () => Promise<void> | undefined) => void
}

export class BrowserSurfaceDelegate implements ISurfaceDelegate {
  private _prefix: string = 'functionary'

  addFlushListeners(flush: () => Promise<void> | undefined) {
    addEventListener('beforeunload', flush)
  }

  get(key: string): string | null {
    if (typeof localStorage === 'undefined') {
      return null
    }
    const prefixedKey = `${this._prefix}-${key}`
    return localStorage.getItem(prefixedKey)
  }
  set(key: string, value: string): void {
    // if (typeof localStorage === 'undefined') {
    //   return
    // }
    const prefixedKey = `${this._prefix}-${key}`
    localStorage.setItem(prefixedKey, value)
  }
  remove(key: string): void {
    if (typeof localStorage === 'undefined') {
      return
    }
    const prefixedKey = `${this._prefix}-${key}`
    localStorage.removeItem(prefixedKey)
  }
  clear() {
    if (typeof localStorage === 'undefined') {
      return
    }
    localStorage.clear()
  }
}

export class NodeSurfaceDelegate implements ISurfaceDelegate {
  private static _memory: { [key: string]: string } = {}

  addFlushListeners(flush: () => Promise<void> | undefined) {
    //https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
    //do something when app is closing
    process.on('exit', flush)

    //catches ctrl+c event
    process.on('SIGINT', flush)

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', flush)
    process.on('SIGUSR2', flush)

    //catches uncaught exceptions
    process.on('uncaughtException', flush)
  }

  get(key: string): string | null {
    if (NodeSurfaceDelegate._memory.hasOwnProperty(key)) {
      return NodeSurfaceDelegate._memory[key]
    } else {
      return null
    }
  }
  set(key: string, value: string): void {
    NodeSurfaceDelegate._memory[key] = value
  }
  remove(key: string): void {
    if (NodeSurfaceDelegate._memory.hasOwnProperty(key)) {
      delete NodeSurfaceDelegate._memory[key]
    }
  }
  clear() {
    NodeSurfaceDelegate._memory = {}
  }
}
