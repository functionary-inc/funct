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

type FunctionaryOptions = { surface: 'server'; httpHandler: any } | { surface: 'browser' }

/**
 * Creates a new Functionary object.
 *
 * @constructor
 */
export class Functionary {
  private _apikey: string | null = null
  private _baseURL: string = 'https://functionary.run/api/v1/'
  private _prefix: string = 'functionary'
  private _opts: FunctionaryOptions

  private _debug: string = 'false'

  constructor(opts: FunctionaryOptions) {
    this._opts = opts

    if (!!process && !!process.env && !!process.env.NEXT_PUBLIC_FUNCTIONARY_API_KEY) {
      this._apikey = process.env.NEXT_PUBLIC_FUNCTIONARY_API_KEY
    } else if (!!process && !!process.env && !!process.env.FUNCTIONARY_API_KEY) {
      this._apikey = process.env.FUNCTIONARY_API_KEY
      //@ts-ignore Remix was for doing front-end env vars
    } else if (!!window && !!window.env && !!window.env.FUNCTIONARY_API_KEY) {
      //@ts-ignore Remix was for doing front-end env vars
      this._apikey = window.env.FUNCTIONARY_API_KEY
    }

    if (!!process && !!process.env && !!process.env.NEXT_PUBLIC_FUNCTIONARY_DEBUG) {
      this._debug = process.env.NEXT_PUBLIC_FUNCTIONARY_DEBUG
    } else if (!!process && !!process.env && !!process.env.FUNCTIONARY_DEBUG) {
      this._debug = process.env.FUNCTIONARY_DEBUG
      //@ts-ignore Remix was for doing front-end env vars
    } else if (!!window && !!window.env && !!window.env.FUNCTIONARY_DEBUG) {
      //@ts-ignore Remix was for doing front-end env vars
      this._debug = window.env.FUNCTIONARY_DEBUG
    }
  }

  private get httpHandler() {
    switch (this._opts.surface) {
      case 'server':
        return this._opts.httpHandler
      case 'browser':
        if (!!window && !!window.fetch) {
          return window.fetch
        } else {
          console.error('FUNCTIONARY: Cannot find fetch function on window.')
        }
    }
  }

  /**
   * @function setBaseUrl - Define the base url for sending the identify and event calls.
   *
   * @param {string} url - url formatted as '(https|http)://{{domain}}.{{TLD}}/', for example, http://example.com/
   */
  setBaseUrl(url: string): void {
    this._baseURL = url
    if (this._opts.surface === 'browser') {
      this.setLS('baseURL', this._baseURL)
    }
  }

  get baseURL(): string | null {
    if (this._opts.surface === 'browser') {
      const potentialbaseURL = this.getLS('baseURL')
      if (!!potentialbaseURL) {
        this._baseURL = potentialbaseURL
        return this._baseURL
      }
    }
    return this._baseURL
  }

  /**
   * @function setApiKey - set the API Key for your functionary workspace.
   *
   * @param {string} apiKey - api key as a string
   */
  setApiKey(apiKey: string): void {
    this._apikey = apiKey
    if (this._opts.surface === 'browser') {
      this.setLS('apiKey', this._apikey)
    }
  }

  get apikey(): string | null {
    if (!!this._apikey) {
      return this._apikey
    }
    if (this._opts.surface === 'browser') {
      const potentialKey = this.getLS('apiKey')
      if (!!potentialKey) {
        this._apikey = potentialKey
        return this._apikey
      }
    }
    console.error(
      'FUNCTIONARY: Functionary API Key not set.  Try calling calling setApiKey(key: string) or set the env var FUNCTIONARY_API_KEY',
    )
    return null
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
    if (this.apikey) {
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
    }
  }

  /**
   * @function identify - calls the identify endpoint of Functionary.
   *
   * @param {FunctionaryIdentify} payload - The payload of the Functionary identify POST request.
   * See the FunctionaryIdentify interface for typing infor ->
   * `import { FunctionaryIdentify } from "@funct/core"`.
   */
  async identify(payload: FunctionaryIdentify): Promise<void> {
    await this._call({ endpoint: 'identify', payload })
  }

  /**
   * @function event - calls the identify endpoint of Functionary.
   *
   * @param {FunctionaryEvent} payload - The payload of the Functionary event POST request. See the
   * FunctionaryEvent interface for typing infor -> `import { FunctionaryEvent } from "@funct/core"`.
   */
  async event(payload: FunctionaryEvent): Promise<void> {
    await this._call({ endpoint: 'event', payload })
  }

  /**
   *
   * Local Storage Wrappers
   *
   */
  private getLS(key: string): string | null {
    const prefixedKey = `${this._prefix}-${key}`
    return localStorage.getItem(prefixedKey)
  }
  private setLS(key: string, value: string): void {
    const prefixedKey = `${this._prefix}-${key}`
    localStorage.setItem(prefixedKey, value)
  }
  private removeLS(key: string): void {
    const prefixedKey = `${this._prefix}-${key}`
    localStorage.removeItem(prefixedKey)
  }
  private clear() {
    localStorage.clear()
  }
}
