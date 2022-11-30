import { IStorageDelegate } from './StorageDelegate'
export { BrowserStorageDelegate, ServerStorageDelegate } from './StorageDelegate'

/**
 * @interface Interface describing the payload expected by the `identify` API endpoint.
 * See for detailed explination of params => https://docs.functionary.run/identify
 *
 * @param {string} model - __REQUIRED__ the name of the model type for the object being identified
 * @param {(string | number)[]} ids - __REQUIRED__ list of ids to identify the model
 * @param {string} [displayName] - the name to be displayed to identify the model
 * @param {Object} [properties] - list of properties to add to the object
 * @param {(string | number)[]} [childIds] - ids to assign a child to the model being identified
 * @param {string} [childModel] - model type of the a child being assigned
 * @param {(string | number)[]} [parentIds] - ids to assign a parent to the model being identified
 * @param {string} [parentModel] - model type of the a child being assigned
 */
export interface FunctionaryIdentify {
  model: string
  ids: (string | number)[]
  displayName?: string
  properties?: object
  childIds?: (string | number)[]
  childModel?: string
  parentIds?: (string | number)[]
  parentModel?: string
}

/**
 * @interface FunctionaryEvent - Interface describing the payload expected by the `events` endpoint.
 * See for detailed explination of params => https://docs.functionary.run/events
 *
 * @param {string} name - __REQUIRED__ the name event for the model.
 * @param {(string | number)[]} ids - __REQUIRED__ list of ids to identify the model
 * @param {string} [model] - the name of the model type for the object.  This is optional, but you should include it if you have it, because it prevents ID clashes across models.
 * @param {Object} [properties] - list of properties to add to the object
 *
 */
export interface FunctionaryEvent {
  name: string
  ids: (string | number)[]
  model?: string
  properties?: object
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
  event: (payload: FunctionaryEvent) => Promise<void>
  /**
   * @function setBaseUrl - Define the base url for sending the identify and event calls.
   *
   * @param {string} url - url formatted as '(https|http)://{{domain}}.{{TLD}}/', for example, http://example.com/
   */
  setBaseUrl(url: string): void
}

export abstract class BaseFunctionary implements Functionary {
  private _apikey: string | null = null
  private _baseURL: string = 'https://functionary.run/api/v1/'

  private _debug: string = 'false'

  private storageDelegate: IStorageDelegate
  private httpHandler: (...args: any[]) => Promise<any>

  constructor(storageDelegate: IStorageDelegate, httpHandler: (...args: any[]) => Promise<any>) {
    this.storageDelegate = storageDelegate
    this.httpHandler = httpHandler

    this.setupFromEnv()
  }

  setBaseUrl(url: string): void {
    this.baseURL = url
  }

  setApiKey(apiKey: string): void {
    this.apikey = apiKey
  }

  async identify(payload: FunctionaryIdentify): Promise<void> {
    await this._call({ endpoint: 'identify', payload })
  }

  async event(payload: FunctionaryEvent): Promise<void> {
    await this._call({ endpoint: 'event', payload })
  }

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

  private _log(toLog: unknown) {
    if (this._debug === 'true') {
      console.log(`FUNCTIONARY: ${JSON.stringify(toLog)}`)
    }
  }

  private async _call(
    requestOpts:
      | { endpoint: 'identify'; payload: FunctionaryIdentify }
      | { endpoint: 'event'; payload: FunctionaryEvent },
  ) {
    const { endpoint, payload } = requestOpts
    if (this.apikeyExists()) {
      try {
        const resp = await this.httpHandler(`${this.baseURL}${endpoint}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apikey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        this._log(await resp.json())
      } catch (err) {
        this._log(err)
      }
      return
    } else {
      console.error(
        'FUNCTIONARY: Functionary API Key not set.  Try calling calling setApiKey(key: string) or set the env var FUNCTIONARY_API_KEY',
      )
    }
  }
}
