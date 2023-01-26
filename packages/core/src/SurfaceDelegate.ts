export interface ISurfaceDelegate {
  get: (key: string) => string | null
  set: (key: string, value: string) => void
  remove: (key: string) => void
  clear: () => void
  addFlushListeners: (flush: () => Promise<void> | undefined) => void
}

export class BrowserSurfaceDelegate implements ISurfaceDelegate {
  private _prefix: string = 'functionary_client_'
  private _persistenceType: 'both' | 'cookie' | 'localStorage'

  constructor(persistenceType: 'both' | 'cookie' | 'localStorage' = 'both') {
    this._persistenceType = persistenceType
  }

  addFlushListeners(flush: () => Promise<void> | undefined) {
    addEventListener('beforeunload', flush)
  }

  get(key: string): string | null {
    const prefixedKey = `${this._prefix}${key}`
    let lsValue = null
    let cValue = null

    if (this._persistenceType === 'both' || this._persistenceType === 'localStorage') {
      lsValue = this._getLS(prefixedKey)
    }
    if (this._persistenceType === 'both' || this._persistenceType === 'cookie') {
      cValue = this._getCookie(prefixedKey)
    }

    return lsValue || cValue
  }

  private _getCookie(prefixedKey: string) {
    if (typeof document === 'undefined') {
      return null
    } else {
      const cookieObj = new URLSearchParams(document.cookie.replaceAll('&', '%26').replaceAll('; ', '&'))
      return cookieObj.get(prefixedKey)
    }
  }

  private _getLS(prefixedKey: string) {
    if (typeof localStorage === 'undefined') {
      return null
    } else {
      return localStorage.getItem(prefixedKey)
    }
  }

  set(key: string, value: string): void {
    const prefixedKey = `${this._prefix}${key}`

    if (this._persistenceType === 'both' || this._persistenceType === 'localStorage') {
      this._setLS(prefixedKey, value)
    }
    if (this._persistenceType === 'both' || this._persistenceType === 'cookie') {
      this._setCookie(prefixedKey, value)
    }
  }

  private _setCookie(prefixedKey: string, value: string) {
    const yearFromNow = new Date()
    yearFromNow.setFullYear(yearFromNow.getFullYear() + 1)
    if (typeof document === 'undefined') {
      return null
    } else {
      document.cookie = `${prefixedKey}=${value}; expires=${yearFromNow.toUTCString()}; SameSite=Lax`
    }
  }

  private _setLS(prefixedKey: string, value: string) {
    if (typeof localStorage === 'undefined') {
      return null
    } else {
      localStorage.setItem(prefixedKey, value)
    }
  }

  remove(key: string): void {
    const prefixedKey = `${this._prefix}${key}`

    if (this._persistenceType === 'both' || this._persistenceType === 'localStorage') {
      this._removeLS(prefixedKey)
    }
    if (this._persistenceType === 'both' || this._persistenceType === 'cookie') {
      this._removeCookie(prefixedKey)
    }
  }

  private _removeCookie(prefixedKey: string) {
    if (typeof document === 'undefined') {
      return null
    } else {
      document.cookie = `${prefixedKey}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`
    }
  }

  private _removeLS(prefixedKey: string) {
    if (typeof localStorage === 'undefined') {
      return null
    } else {
      localStorage.removeItem(prefixedKey)
    }
  }

  clear() {
    if (this._persistenceType === 'both' || this._persistenceType === 'localStorage') {
      this._clearLS(this._prefix)
    }
    if (this._persistenceType === 'both' || this._persistenceType === 'cookie') {
      this._clearCookie(this._prefix)
    }
  }

  private _clearCookie(prefix: string) {
    if (typeof document === 'undefined') {
      return null
    } else {
      document.cookie.split(';').forEach(cookie => {
        const cookieName = cookie.trim().split('=')[0]
        if (cookieName.startsWith(prefix)) {
          document.cookie = cookieName + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
      })
    }
  }

  private _clearLS(prefix: string) {
    if (typeof localStorage === 'undefined') {
      return null
    } else {
      Object.keys(localStorage)
        .filter(x => x.startsWith(prefix))
        .forEach(x => localStorage.removeItem(x))
    }
  }
}

export class NodeSurfaceDelegate implements ISurfaceDelegate {
  private static _memory: { [key: string]: string } = {}

  addFlushListeners(flush: () => Promise<void> | undefined) {
    // https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
    // do something when app is closing
    process.on('exit', flush)

    // catches ctrl+c event
    process.on('SIGINT', flush)

    // catches "kill pid" (for example: nodemon restart)
    process.on('SIGUSR1', flush)
    process.on('SIGUSR2', flush)

    // catches uncaught exceptions
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
