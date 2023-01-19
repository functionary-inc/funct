import { DebouncedFunc } from 'lodash'

export interface ISurfaceDelegate {
  get: (key: string) => string | null
  set: (key: string, value: string) => void
  remove: (key: string) => void
  clear: () => void
  tickDelay: number
  setupClock: (tick: () => DebouncedFunc<() => Promise<void>>) => void
}

export class BrowserSurfaceDelegate implements ISurfaceDelegate {
  private _prefix: string = 'functionary'
  tickDelay: number = 2000

  _timer: NodeJS.Timer | null = null

  setupClock(tick: () => DebouncedFunc<() => Promise<void>>) {

    console.log("hello world")

    const throttler = tick()

    addEventListener('beforeunload', throttler.flush);

    // console.log("this._timer", !!this._timer)

    // if(!this._timer){
    //   this._timer = setInterval(
    //     tick,
    //     this.tickDelay
    //   )
    // }
  }

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

export class NodeSurfaceDelegate implements ISurfaceDelegate {
  private static _memory: { [key: string]: string } = {}
  tickDelay: number = 2000

  setupClock(functInstance: any) {
    setInterval(
      functInstance.tick(),
      this.tickDelay
    )
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
