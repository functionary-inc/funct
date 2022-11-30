export interface IStorageDelegate {
  get: (key: string) => string | null
  set: (key: string, value: string) => void
  remove: (key: string) => void
  clear: () => void
}

export class BrowserStorageDelegate implements IStorageDelegate {
  private _prefix: string = 'functionary'

  get(key: string): string | null {
    const prefixedKey = `${this._prefix}-${key}`
    return localStorage.getItem(prefixedKey)
  }
  set(key: string, value: string): void {
    const prefixedKey = `${this._prefix}-${key}`
    localStorage.setItem(prefixedKey, value)
  }
  remove(key: string): void {
    const prefixedKey = `${this._prefix}-${key}`
    localStorage.removeItem(prefixedKey)
  }
  clear() {
    localStorage.clear()
  }
}

export class ServerStorageDelegate implements IStorageDelegate {
  private static _memory: { [key: string]: string } = {}

  get(key: string): string | null {
    if (ServerStorageDelegate._memory.hasOwnProperty(key)) {
      return ServerStorageDelegate._memory[key]
    } else {
      return null
    }
  }
  set(key: string, value: string): void {
    ServerStorageDelegate._memory[key] = value
  }
  remove(key: string): void {
    if (ServerStorageDelegate._memory.hasOwnProperty(key)) {
      delete ServerStorageDelegate._memory[key]
    }
  }
  clear() {
    ServerStorageDelegate._memory = {}
  }
}
