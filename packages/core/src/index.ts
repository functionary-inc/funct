import axios, { AxiosResponse } from 'axios'
import { IStorageDelegate } from './StorageDelegate'
export { BrowserStorageDelegate, ServerStorageDelegate } from './StorageDelegate'

/**
 * @interface Interface describing the payload expected by the `identify` API endpoint.
 * See for detailed explination of params => https://docs.functionary.run/identify
 *
 * @param {string} model - __REQUIRED__ the name of the model type for the object being identified
 * @param {(string | number)[]} ids - __REQUIRED__ list of ids to identify the model
 * @param {Object} [properties] - list of properties to add to the entity
 * @param {(string | number)[]} [childIds] - ids to assign a child to the entity being identified
 * @param {(string | number)} [parentId] - id to assign a parent to the entity being identified
 */
export interface FunctionaryIdentify {
  model: string
  ids: (string | number)[]
  properties?: object
  childIds?: (string | number)[]
  parentId: string | number
}

/**
 * @interface FunctionaryState - Interface describing the a `event` to be sent in a `event` payload.
 * See for detailed explination of params => https://docs.functionary.run/events
 *
 * @param {string} name - __REQUIRED__ the name event.
 * @param {string} ts - __REQUIRED__ the timestamp of the event.
 * @param {Object} [properties] - list of properties to add to the object
 *
 */
export interface FunctionaryState {
  name: string
  ts: number
  properties?: object
}

/**
 * @interface FunctionaryStatesPayload - Interface describing the payload expected by the `events` endpoint.
 * See for detailed explination of params => https://docs.functionary.run/events
 *
 * @param {(string | number)[]} ids - __REQUIRED__ list of ids to identify the model
 * @param {string} [model] - the name of the model type for the object.  This is optional, but you should include it if you have it, because it prevents ID clashes across models.
 * @param {FunctionaryState[]} [states] - list of states to be sent in the payload
 *
 */
export interface FunctionaryStatePayload {
  ids: (string | number)[]
  model: string
  states?: FunctionaryState[]
}

/**
 * Describes a Functionary object.
 *
 * @interface
 */
export interface Functionary {
  /**
   * @function setApiKey - set the API Key for your functionary workspace.
   *
   * @param {string} apiKey - api key as a string
   */
  setApiKey: (apiKey: string) => void
  /**
   * @function identify - calls the identify endpoint of Functionary.
   *
   * @param {FunctionaryIdentify} payload - The payload of the Functionary identify POST request.
   * See the FunctionaryIdentify interface for typing infor ->
   * `import { FunctionaryIdentify } from "@funct/core"`.
   */
  identify: (payload: FunctionaryIdentify) => Promise<void>
  /**
   * @function event - calls the identify endpoint of Functionary.
   *
   * @param {FunctionaryEvent} payload - The payload of the Functionary event POST request. See the
   * FunctionaryEvent interface for typing infor -> `import { FunctionaryEvent } from "@funct/core"`.
   */
  event: (payload: FunctionaryState) => Promise<void>
  /**
   * @function setBaseUrl - Define the base url for sending the identify and event calls.
   *
   * @param {string} url - url formatted as '(https|http)://{{domain}}.{{TLD}}', for example, http://example.com
   */
  setBaseUrl(url: string): void
}

export abstract class BaseFunctionary implements Functionary {
  private _apikey: string | null = null
  private _baseURL: string = 'https://functionary.run/api/v1'

  private _debug: string = 'false'
  private _shouldStub: boolean = false

  private storageDelegate: IStorageDelegate

  constructor(storageDelegate: IStorageDelegate, opts: { stub: boolean }) {
    this._shouldStub = opts.stub

    this.storageDelegate = storageDelegate

    this.setupFromEnv()
  }

  setBaseUrl(url: string): void {
    this.baseURL = url
  }

  setApiKey(apiKey: string): void {
    this.apikey = apiKey
  }

  // setEntity(entity: { model: string; ids: (string | number)[] }): void {
  //   this.entity = entity
  // }

  // get entity(): string | null {
  //   if (this.apikeyExists()) {
  //     return this.entity
  //   } else {
  //     return null
  //   }
  // }

  // set entity(key: string | null) {
  //   if (key) {
  //     this._apikey = key
  //     this.storageDelegate.set('apiKey', key)
  //   } else {
  //     this._apikey = null
  //     this.storageDelegate.remove('apiKey')
  //   }
  // }

  identify(payload: FunctionaryIdentify): Promise<void> {
    return this._call({ endpoint: '/identify', payload })
  }

  event(payload: FunctionaryState): Promise<void> {
    return Promise.resolve()
    // return this._call({ endpoint: '/event', payload })
  }

  // async eventTicker() {
  //   setInterval(await this._call({ endpoint: '/event', payload }), 30000)
  // }

  get baseURL(): string {
    return this._baseURL
  }

  set baseURL(url: string) {
    this._baseURL = url
    this.storageDelegate.set('baseURL', url)
  }

  setupFromEnv() {
    if (!!process && !!process.env && !!process.env.NEXT_PUBLIC_FUNCTIONARY_API_KEY) {
      this._apikey = process.env.NEXT_PUBLIC_FUNCTIONARY_API_KEY
    } else if (!!process && !!process.env && !!process.env.FUNCTIONARY_API_KEY) {
      this._apikey = process.env.FUNCTIONARY_API_KEY
    }

    if (!!process && !!process.env && !!process.env.NEXT_PUBLIC_FUNCTIONARY_DEBUG) {
      this._debug = process.env.NEXT_PUBLIC_FUNCTIONARY_DEBUG
    } else if (!!process && !!process.env && !!process.env.FUNCTIONARY_DEBUG) {
      this._debug = process.env.FUNCTIONARY_DEBUG
    }
  }

  setupFromStorageDelegate() {
    const keyFromStorage = this.storageDelegate.get('apiKey')
    if (!!keyFromStorage) {
      this.apikey = keyFromStorage
    }

    const baseURLFromStorage = this.storageDelegate.get('baseURL')
    if (!!baseURLFromStorage) {
      this.baseURL = baseURLFromStorage
    }
  }

  apikeyExists(): boolean {
    return !!this._apikey
  }

  get apikey(): string | null {
    if (this.apikeyExists()) {
      return this._apikey
    } else {
      return null
    }
  }

  set apikey(key: string | null) {
    if (key) {
      this._apikey = key
      this.storageDelegate.set('apiKey', key)
    } else {
      this._apikey = null
      this.storageDelegate.remove('apiKey')
    }
  }

  private _log(message: string, type: 'error' | 'warning' | 'normal' = 'normal') {
    if (this._debug === 'true') {
      switch (type) {
        case 'error':
          console.error(`[FUNCTIONARY ERROR] ${message}`)
        case 'warning':
          console.warn(`[Functionary] ${message}`)
        default:
          console.log(`[Functionary] ${message}`)
      }
    }
  }

  private _call(
    requestOpts:
      | { endpoint: '/identify'; payload: FunctionaryIdentify }
      | { endpoint: '/event'; payload: FunctionaryStatePayload },
  ): Promise<void> {
    if (this.apikeyExists()) {
      return this._http(requestOpts)
        .then(resp => {
          this._log(`${requestOpts.endpoint} response: ${resp.status} ${JSON.stringify(resp.data)}`)
        })
        .catch(err => {
          const mess = (err as Error).message || 'There was an error'
          this._log(`${requestOpts.endpoint} response: ${mess}`, 'error')
        })
    } else {
      console.error(
        'FUNCTIONARY: Functionary API Key not set.  Try calling calling setApiKey(key: string) or set the env var FUNCTIONARY_API_KEY',
      )
      return Promise.resolve()
    }
  }

  private _http(
    requestOpts:
      | { endpoint: '/identify'; payload: FunctionaryIdentify }
      | { endpoint: '/event'; payload: FunctionaryStatePayload },
  ): Promise<AxiosResponse<any>> {
    const { endpoint, payload } = requestOpts
    if (this._shouldStub) {
      return Promise.resolve({
        data: {},
        status: 200,
        statusText: '',
        headers: {},
        config: {
          method: 'POST',
          baseURL: this.baseURL,
          headers: {
            Authorization: `Bearer ${this.apikey}`,
            'Content-Type': 'application/json',
          },
        },
      })
    } else {
      return axios.post(`${endpoint}`, payload, {
        method: 'POST',
        baseURL: this.baseURL,
        headers: {
          Authorization: `Bearer ${this.apikey}`,
          'Content-Type': 'application/json',
        },
      })
    }
  }
}
