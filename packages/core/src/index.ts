import axios, { AxiosResponse } from 'axios'
import { ISurfaceDelegate } from './SurfaceDelegate'
export { BrowserSurfaceDelegate } from './SurfaceDelegate'
import throttle from 'lodash.throttle'
import union from 'lodash.union'
import { DebouncedFunc } from 'lodash'

/**
 * @interface FunctionaryEntity describing the minimal properties to identify an entity.
 *
 * @param {string} model - __REQUIRED__ the name of the model type for the object being identified
 * @param {(string | number)[]} ids - __REQUIRED__ list of ids to identify the model
 */
export interface FunctionaryEntity {
  model: string
  ids: (string | number)[]
}

/**
 * @interface FunctionaryIdentify describing the payload expected by the `identify` API endpoint.
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
  parentId?: string | number
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
 * @param {string} [model] - __REQUIRED__ the name of the model type for the object.
 * @param {FunctionaryState[]} [states] - __REQUIRED__ list of states to be sent in the payload
 *
 */
export interface FunctionaryStatePayload {
  ids: (string | number)[]
  model: string
  states: FunctionaryState[]
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
  event: (payload: FunctionaryState, model: string) => void
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

  private _debug: boolean
  private _stub: boolean
  private _fireOnNextEvent: boolean

  private surfaceDelegate: ISurfaceDelegate

  constructor(
    surfaceDelegate: ISurfaceDelegate,
    opts?: { stub: boolean; debug: boolean; fireOnInstantiation: boolean },
  ) {
    const { stub = false, debug = false, fireOnInstantiation = true } = opts || {}

    this._stub = stub
    this._fireOnNextEvent = fireOnInstantiation
    this._debug = debug

    this.surfaceDelegate = surfaceDelegate

    this.setupFromEnv()
  }

  setBaseUrl(url: string): void {
    this.baseURL = url
  }

  get baseURL(): string {
    return this._baseURL
  }

  set baseURL(url: string) {
    this._baseURL = url
    this.surfaceDelegate.set('baseURL', url)
  }

  setApiKey(apiKey: string): void {
    this.apikey = apiKey
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
      this.surfaceDelegate.set('apiKey', key)
    } else {
      this._apikey = null
      this.surfaceDelegate.remove('apiKey')
    }
  }

  private _entityReferenceCache: { [model: string]: string } = {}

  setEntityContext(model: string, ids: (string | number)[]): void {
    if (ids.length === 0) {
      this._log('ids length must be greater than 0 when calling setEntityContext', 'error')
    } else {
      const referenceId = ids[0].toString()
      this._entityReferenceCache[model] = referenceId
      this.surfaceDelegate.set(`${model}ReferenceId`, referenceId)
    }
  }

  getEntityContext(model: string): string | null {
    if (this._entityReferenceCache.hasOwnProperty(model)) {
      return this._entityReferenceCache[model]
    } else {
      const potentialId = this.surfaceDelegate.get(`${model}ReferenceId`)
      if (potentialId) {
        this._entityReferenceCache[model] = potentialId
        return potentialId
      } else {
        return null
      }
    }
  }

  revokeEntityContext(model: string): void {
    if (this._entityReferenceCache.hasOwnProperty(model)) {
      delete this._entityReferenceCache[model]
    }
    this.surfaceDelegate.remove(`${model}ReferenceId`)
  }

  restoreEntityContext(model: string): boolean {
    const potentialId = this.surfaceDelegate.get(`${model}ReferenceId`)
    if (potentialId) {
      this._entityReferenceCache[model] = potentialId
      return true
    } else {
      return false
    }
  }

  identify(payload: Omit<FunctionaryIdentify, 'parentId' | 'childIds'>): Promise<void> {
    if (payload.model !== 'customer' && payload.model !== 'organization') {
      const errMess = `functionary can only accept "organization" or "customer" as a model type.`
      this._log(errMess, 'error')
      return Promise.reject(errMess)
    }

    return this._call({ endpoint: '/identify', payload })
  }

  eventWithEntity(payload: FunctionaryState, entity: FunctionaryEntity): void {
    this.cacheOrSendEvent(payload, entity)
  }

  event(payload: FunctionaryState, model: string): void {
    const knownId = this.getEntityContext(model)
    if (knownId) {
      this.cacheOrSendEvent(payload, { model, ids: [knownId] })
    } else {
      this._log('Unable to load entity id from context correctly', 'error')
    }
  }

  setupFromEnv() {
    if (!!process && !!process.env && !!process.env.NEXT_PUBLIC_FUNCTIONARY_API_KEY) {
      this._apikey = process.env.NEXT_PUBLIC_FUNCTIONARY_API_KEY
    } else if (!!process && !!process.env && !!process.env.FUNCTIONARY_API_KEY) {
      this._apikey = process.env.FUNCTIONARY_API_KEY
    }

    if (!!process && !!process.env && !!process.env.NEXT_PUBLIC_FUNCTIONARY_DEBUG) {
      this._debug = process.env.NEXT_PUBLIC_FUNCTIONARY_DEBUG === 'true'
    } else if (!!process && !!process.env && !!process.env.FUNCTIONARY_DEBUG) {
      this._debug = process.env.FUNCTIONARY_DEBUG === 'true'
    }
  }

  setupFromSurfaceDelegate(modelsToRestore: string[]) {
    const keyFromSurface = this.surfaceDelegate.get('apiKey')
    if (!!keyFromSurface) {
      this.apikey = keyFromSurface
    }

    modelsToRestore.forEach(model => this.restoreEntityContext(model))

    const baseURLFromSurface = this.surfaceDelegate.get('baseURL')
    if (!!baseURLFromSurface) {
      this.baseURL = baseURLFromSurface
    }
  }

  private _log(message: string, type: 'error' | 'warning' | 'normal' = 'normal') {
    if (this._debug) {
      switch (type) {
        case 'error':
          console.error(`[FUNCTIONARY ERROR] ${message}`)
        case 'warning':
          console.warn(`[FUNCTIONARY] ${message}`)
        default:
          console.log(`[FUNCTIONARY] ${message}`)
      }
    }
  }

  static _stateCache: FunctionaryStatePayload[] = []
  static _stateCacheCount: number = 0
  private throttledSendEvents: DebouncedFunc<() => Promise<void>> | undefined

  cacheOrSendEvent(state: FunctionaryState, entity: FunctionaryEntity): void {
    let eventWasAdded = false
    for (var entStateInd = 0; entStateInd < BaseFunctionary._stateCache.length; entStateInd++) {
      const statePayload = BaseFunctionary._stateCache[entStateInd]
      if (entity.model === statePayload.model) {
        const statePayloadIds = statePayload.ids
        for (var entIdInd = 0; entIdInd < statePayloadIds.length; entIdInd++) {
          const currId = statePayloadIds[entIdInd]

          if (entity.ids.includes(currId)) {
            BaseFunctionary._stateCache[entStateInd].ids = union(statePayloadIds, entity.ids)
            BaseFunctionary._stateCache[entStateInd].states.push(state)
            BaseFunctionary._stateCacheCount++

            eventWasAdded = true

            entIdInd = BaseFunctionary._stateCache[entStateInd].ids.length
            entStateInd = BaseFunctionary._stateCache.length
          }
        }
      }
    }
    if (!eventWasAdded) {
      BaseFunctionary._stateCacheCount++
      BaseFunctionary._stateCache.push({
        model: entity.model,
        ids: entity.ids,
        states: [state],
      })
    }
    if (!this.throttledSendEvents) {
      this.throttledSendEvents = throttle(this.sendEvents, 10000, { leading: false })
      this.surfaceDelegate.addFlushListeners(this.throttledSendEvents.flush)
      if (this._fireOnNextEvent || BaseFunctionary._stateCacheCount === 300) {
        this.throttledSendEvents.flush()
      }
    }
    this.throttledSendEvents()
  }

  async sendEvents(): Promise<void> {
    const payload = BaseFunctionary._stateCache
    BaseFunctionary._stateCache = []
    BaseFunctionary._stateCacheCount = 0
    return this._call({ endpoint: '/event', payload })
  }

  private _call(
    requestOpts:
      | { endpoint: '/identify'; payload: FunctionaryIdentify }
      | { endpoint: '/event'; payload: FunctionaryStatePayload[] },
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
      const errMess =
        'Functionary API Key not set.  Try calling calling setApiKey(key: string) or set the env var FUNCTIONARY_API_KEY'
      this._log(errMess, 'error')
      return Promise.reject(errMess)
    }
  }

  private _http(
    requestOpts:
      | { endpoint: '/identify'; payload: FunctionaryIdentify }
      | { endpoint: '/event'; payload: FunctionaryStatePayload[] },
  ): Promise<AxiosResponse<any>> {
    const { endpoint, payload } = requestOpts
    if (this._stub) {
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
          'X-Timezone-Offset': new Date().getTimezoneOffset() * 60 * 1000,
          'X-Source': 'client-js',
        },
      })
    }
  }
}
