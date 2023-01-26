import axios, { AxiosResponse } from 'axios'
import { ISurfaceDelegate } from './SurfaceDelegate'
export { BrowserSurfaceDelegate, NodeSurfaceDelegate } from './SurfaceDelegate'
import throttle from 'lodash.throttle'
import union from 'lodash.union'
import { randomUUID } from 'crypto'
import { DebouncedFunc } from 'lodash'

export type FunctionarySupportedModel = 'customer' | 'organization'

/**
 * @interface FunctionaryEntity describing the minimal properties to identify an entity.
 *
 * @param {FunctionarySupportedModel} model - __REQUIRED__ the name of the model type for the object being identified
 * @param {(string | number)[]} ids - __REQUIRED__ list of ids to identify the model
 * @param {Object} [properties] - list of properties to add to the object
 */
export interface FunctionaryEntity {
  model: FunctionarySupportedModel
  ids: (string | number)[]
  properties?: object
}

/**
 * @interface FunctionaryIdentify describing the payload expected by the `identify` API endpoint.
 * See for detailed explination of params => https://docs.functionary.run/identify
 *
 * @param {FunctionarySupportedModel} model - __REQUIRED__ the name of the model type for the object being identified
 * @param {(string | number)[]} ids - __REQUIRED__ list of ids to identify the model
 * @param {Object} [properties] - list of properties to add to the entity
 * @param {(string | number)[]} [childIds] - ids to assign a child to the entity being identified
 * @param {(string | number)} [parentId] - id to assign a parent to the entity being identified
 */
export interface FunctionaryIdentify {
  model: FunctionarySupportedModel
  ids: (string | number)[]
  properties?: object
  children?: Omit<FunctionaryEntity, 'properties'>[]
  parent?: Omit<FunctionaryEntity, 'properties'>
}

/**
 * @interface FunctionaryClientState - Interface describing the a `event` to defined by the client be sent in a `event` payload.
 * See for detailed explination of params => https://docs.functionary.run/states
 *
 * @param {string} name - __REQUIRED__ the name event.
 * @param {Object} [properties] - list of properties to add to the object
 *
 */
export interface FunctionaryClientState {
  name: string
  properties?: object
}

/**
 * @interface FunctionaryState - Interface describing the a `event` to be sent in a `event` payload.
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
 * See for detailed explination of params => https://docs.functionary.run/states
 *
 * @param {(string | number)[]} ids - __REQUIRED__ list of ids to identify the model
 * @param {FunctionarySupportedModel} [model] - __REQUIRED__ the name of the model type for the object.
 * @param {FunctionaryState[]} [states] - __REQUIRED__ list of states to be sent in the payload
 *
 */
export interface FunctionaryStatePayload {
  ids: (string | number)[]
  model: FunctionarySupportedModel
  states: FunctionaryState[]
}

/**
 * @interface Functionary - Describes a Functionary object.
 */
export interface Functionary {
  /**
   * @function setApiKey - set the API Key for your functionary workspace.
   *
   * @param {string} apiKey - __REQUIRED__ api key as a string
   */
  setApiKey: (apiKey: string) => void
  /**
   * @function identify - calls the identify endpoint of Functionary. NOTE: All API calls are batched in 10 second increments.
   *
   * @param {FunctionaryEntity} entity - __REQUIRED__ The properties, ids, and model of the customer or organization to identify.
   * See the FunctionaryEntity interface for typing info -> `import { FunctionaryEntity } from "@funct/core"`.
   *
   * @param {{ setToContext?: boolean }} opts - options for this function.  If `setToContext = true`,
   * then the customer or org will be set to the current context, functionary will automatically set fired events
   * to the customer or org on the context.  Useful if a user is logged in.
   *
   * @example ```
   * // calls the identify endpoint with model and id set. will set customer to context depending on the
   * // default behavior of the surface. react sets the identified customer by default. Node does not.
   * identify({ model: "customer", ids: ["some-ids"], properties: {...props} })
   * // calls the identify endpoit without setting the identified customer
   * // useful if you are sending an event for a user that is NOT logged in, or you are using on a backend
   * // where the many users will share the same context
   * identify({ model: "customer", ids: ["some-ids"], properties: {...props} }, { setToContext: false })
   * ```
   */
  identify: (entity: FunctionaryEntity, opts?: { setToContext?: boolean }) => void
  /**
   * @function event - calls the event endpoint of Functionary. NOTE: All API calls are batched in 10 second increments.
   *
   * @param {FunctionaryClientState} event - __REQUIRED__ The customer or organization event to be sent to functionary. See the
   * FunctionaryClientState interface for typing info -> `import { FunctionaryClientState } from "@funct/core"`.
   *
   * @param {FunctionarySupportedModel | FunctionaryEntity} opts - allows you to specify the customer or organization
   * on which an event will be assigned. By default, it uses the customer on the context. See the FunctionarySupportedModel,
   * FunctionaryEntity interfaces for typing info -> `import { FunctionarySupportedModel, FunctionaryEntity } from "@funct/core"`.
   *
   * @example ```
   * // Uses the customer set on the context.
   * event({ name: "sign_up" })
   * // Uses the organization | customer set on the context.
   * event({ name: "sign_up" }, "organization")
   * event({ name: "sign_up" }, "customer")
   * // Uses the customer with the ids in the Arr of the ids
   * event({ name: "sign_up" }, { model: "customer", ids: ["some-id"] } )
   * ```
   */
  event: (event: FunctionaryClientState, opts?: FunctionarySupportedModel | FunctionaryEntity) => void
  /**
   * @function assign - allows developer to assign a customer to an organization.
   *
   * @param {Omit<FunctionaryEntity, 'properties'>} child - __REQUIRED__ The entity to become the child.  This should always be a "customer".
   *
   * @param {Omit<FunctionaryEntity, 'properties'>} parent - __REQUIRED__ The entity to become the parent.  This should always be a "organization".
   *
   * @example ```
   * // Uses the customer set on the context.
   * assign({ model: "customer", ids: ["customer-id"] }, { model: "organization", ids: ["organization-id"] })
   * ```
   */
  assign: (child: Omit<FunctionaryEntity, 'properties'>, parent: Omit<FunctionaryEntity, 'properties'>) => void
  /**
   * @function addProperties - allows developer to add a property to the customer or organization on the context.  Only
   * works with the customer set on the context.
   *
   * @param {object} properties - __REQUIRED__ The dictionary of products to add to the customer or organization
   *
   * @param {FunctionarySupportedModel | Omit<FunctionaryEntity, 'properties'>} opts - allows you to specify the customer or organization
   * on which an property will be assigned. By default, it uses the customer on the context. See the FunctionarySupportedModel,
   * FunctionaryEntity interfaces for typing info -> `import { FunctionarySupportedModel, FunctionaryEntity } from "@funct/core"`.
   *
   * @example ```
   * // Uses the customer set on the context.
   * addProperties({ aprop: "theValue" })
   * // Uses the organization | customer set on the context.
   * addProperties({ aprop: "theValue" }, "organization")
   * addProperties({ aprop: "theValue" }, "customer")
   * // Uses the customer with the ids in the Arr of the ids
   * addProperties({ aprop: "theValue" }, { model: "customer", ids: ["some-id"] } )
   * ```
   */
  addProperties: (properties: object, opts?: FunctionarySupportedModel | FunctionaryEntity) => void
  /**
   * @function resetContext - allows developer to wipe out the context, specifically when a user logs out.
   *
   * @param {FunctionarySupportedModel[]} models - sets which models to revoke the context from.
   * By default, its both `['customer', 'organization']`
   *
   * @example ```
   * // By default, its both `['customer', 'organization']`
   * resetContext()
   * // just resets customer
   * resetContext(['customer'])
   * // just resets organization
   * resetContext(['organization'])
   * ```
   */
  resetContext: (models?: FunctionarySupportedModel[]) => void
}

export abstract class BaseFunctionary implements Functionary {
  private _apikey: string | null = null
  private baseURL: string

  private _debug: boolean
  private _stub: boolean
  private _fireOnNextEvent: boolean
  private _fireOnNextIdentify: boolean

  private surfaceDelegate: ISurfaceDelegate

  constructor(
    surfaceDelegate: ISurfaceDelegate,
    opts?: { stub?: boolean; debug?: boolean; fireOnInstantiation?: boolean; baseURL?: string },
  ) {
    const {
      stub = false,
      debug = false,
      fireOnInstantiation = true,
      baseURL = 'https://functionary.run/api/v1',
    } = opts || {}

    this._stub = stub
    this._fireOnNextEvent = fireOnInstantiation
    this._fireOnNextIdentify = fireOnInstantiation
    this._debug = debug
    this.baseURL = baseURL

    this.surfaceDelegate = surfaceDelegate

    this.setupFromEnv()
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

  setEntityContext(entity: FunctionaryEntity): void {
    const { ids, model } = entity
    if (ids.length === 0) {
      this._log('ids length must be greater than 0 when calling setEntityContext', 'error')
    } else {
      const referenceId = ids[0].toString()
      this._entityReferenceCache[model] = referenceId
      this.surfaceDelegate.set(`${model}ReferenceId`, referenceId)
    }
  }

  addProperties(
    properties: object,
    opts: FunctionarySupportedModel | Omit<FunctionaryEntity, 'properties'> = 'customer',
  ) {
    if (opts.hasOwnProperty('ids')) {
      // send event with the entity passed in
      this.cacheOrSendIdentify({ ...(opts as Omit<FunctionaryEntity, 'properties'>), properties })
    } else {
      const model = opts as FunctionarySupportedModel

      const knownId = this.getEntityContext(model)
      if (knownId) {
        // send event with entity from current context
        this.cacheOrSendIdentify({ ids: [knownId], model, properties })
      } else {
        this._log(`Unable to load ${model} id from context correctly`, 'error')
      }
    }
  }

  getEntityContext(model: FunctionarySupportedModel): string | null {
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

  revokeEntityContext(model: FunctionarySupportedModel): void {
    if (this._entityReferenceCache.hasOwnProperty(model)) {
      delete this._entityReferenceCache[model]
    }
    this.surfaceDelegate.remove(`${model}ReferenceId`)
  }

  restoreEntityContext(model: FunctionarySupportedModel): boolean {
    const potentialId = this.surfaceDelegate.get(`${model}ReferenceId`)
    if (potentialId) {
      this._entityReferenceCache[model] = potentialId
      return true
    } else {
      return false
    }
  }

  resetContext(models: FunctionarySupportedModel[] = ['customer', 'organization']): void {
    return models.forEach(model => this.revokeEntityContext(model))
  }

  assign(child: Omit<FunctionaryEntity, 'properties'>, parent: Omit<FunctionaryEntity, 'properties'>): void {
    if (child.model !== 'customer' || parent.model !== 'organization') {
      const errMess = `functionary can only accept "organization" or "customer" as a model type.`
      this._log(errMess, 'error')
    }

    this.cacheOrSendIdentify({ ...child, parent })
  }

  identify(entity: FunctionaryEntity, opts?: { setToContext?: boolean }): void {
    if (!this.apikeyExists()) {
      const errMess =
        'Functionary API Key not set.  Try calling calling setApiKey(key: string) or set the env var FUNCTIONARY_API_KEY or NEXT_PUBLIC_FUNCTIONARY_API_KEY'
      this._log(errMess, 'error')
      return
    }

    if (entity.model !== 'customer' && entity.model !== 'organization') {
      const errMess = `functionary can only accept "organization" or "customer" as a model type.`
      this._log(errMess, 'error')
    }

    if (opts && opts.setToContext) {
      this.setEntityContext(entity)
    }

    this.cacheOrSendIdentify(entity)
  }

  private static _identifyCache: FunctionaryIdentify[] = []
  private throttledSendIdentify: DebouncedFunc<() => Promise<void>> | undefined

  private cacheOrSendIdentify(entity: FunctionaryIdentify): void {
    const targetIdx = BaseFunctionary._indexOfEntityInCache(entity, BaseFunctionary._identifyCache)

    if (targetIdx === -1) {
      BaseFunctionary._identifyCache.push({ ...entity, ids: entity.ids.map(id => id.toString()) })
    } else {
      const existingTargetIds = BaseFunctionary._identifyCache[targetIdx].ids
      BaseFunctionary._identifyCache[targetIdx].ids = union(
        existingTargetIds,
        entity.ids.map(id => id.toString()),
      )
      if (entity.parent) {
        // last write wins
        BaseFunctionary._identifyCache[targetIdx].parent = entity.parent
      }
      // not idompotent
      // if (entity.children) {
      //   const existingTargetChildIds = BaseFunctionary._identifyCache[targetIdx].childIds || []
      //   BaseFunctionary._identifyCache[targetIdx].childIds = union(existingTargetChildIds, entity.childIds)
      // }
      if (entity.properties) {
        const existingTargetProperties = BaseFunctionary._identifyCache[targetIdx].properties || {}
        // last write wins. Same as API
        BaseFunctionary._identifyCache[targetIdx].properties = { ...existingTargetProperties, ...entity.properties }
      }
    }

    if (!this.throttledSendIdentify) {
      this.throttledSendIdentify = throttle(this.sendIdentifies, 10000, { leading: false })
      this.surfaceDelegate.addFlushListeners(this.throttledSendIdentify.flush)
    }

    this.throttledSendIdentify()

    if (this._fireOnNextIdentify) {
      this._fireOnNextIdentify = false
      this.throttledSendIdentify.flush()
    }
  }

  private async sendIdentifies(): Promise<void> {
    const payloads = BaseFunctionary._identifyCache
    BaseFunctionary._identifyCache = []
    return payloads.forEach(payload => this._call({ endpoint: '/identify', payload }))
  }

  event(payload: FunctionaryClientState, opts: FunctionarySupportedModel | FunctionaryEntity = 'customer'): void {
    if (!this.apikeyExists()) {
      const errMess =
        'Functionary API Key not set.  Try calling calling setApiKey(key: string) or set the env var FUNCTIONARY_API_KEY or NEXT_PUBLIC_FUNCTIONARY_API_KEY'
      this._log(errMess, 'error')
      return
    }

    const ts = new Date().getTime()
    // check if opts ids exist
    if (opts.hasOwnProperty('ids')) {
      // send event with the entity passed in
      this.cacheOrSendEvent({ ts, ...payload }, opts as FunctionaryEntity)
    } else {
      // get ent from current cxt
      const model = opts as FunctionarySupportedModel

      if (model !== 'customer' && model !== 'organization') {
        const errMess = `functionary can only accept "organization" or "customer" as a model type.`
        this._log(errMess, 'error')
      }

      const knownId = this.getEntityContext(model)
      if (knownId) {
        // send event with entity from current context
        this.cacheOrSendEvent({ ts, ...payload }, { model, ids: [knownId] })
      } else {
        this._log(`Unable to load ${model} id from context correctly`, 'error')
      }
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

  setupFromSurfaceDelegate(modelsToRestore: FunctionarySupportedModel[] = ['customer', 'organization']) {
    const keyFromSurface = this.surfaceDelegate.get('apiKey')
    if (!!keyFromSurface) {
      this.apikey = keyFromSurface
    }

    modelsToRestore.forEach(model => this.restoreEntityContext(model))
  }

  private _log(message: string, type: 'error' | 'warning' | 'normal' = 'normal') {
    if (this._debug) {
      switch (type) {
        case 'error': {
          console.error(`[FUNCTIONARY ERROR] ${message}`)
          return
        }
        case 'warning': {
          console.warn(`[FUNCTIONARY] ${message}`)
          return
        }
        default: {
          console.log(`[FUNCTIONARY] ${message}`)
          return
        }
      }
    }
  }

  private static _stateCache: FunctionaryStatePayload[] = []
  private static _stateCacheCount: number = 0
  private throttledSendEvents: DebouncedFunc<() => Promise<void>> | undefined

  private cacheOrSendEvent(state: FunctionaryState, entity: FunctionaryEntity): void {
    const targetIdx = BaseFunctionary._indexOfEntityInCache(entity, BaseFunctionary._stateCache)

    if (targetIdx === -1) {
      BaseFunctionary._stateCacheCount++
      BaseFunctionary._stateCache.push({
        model: entity.model,
        ids: entity.ids.map(id => id.toString()),
        states: [state],
      })
    } else {
      const targetExistingIds = BaseFunctionary._stateCache[targetIdx].ids
      BaseFunctionary._stateCache[targetIdx].ids = union(
        targetExistingIds,
        entity.ids.map(id => id.toString()),
      )
      BaseFunctionary._stateCache[targetIdx].states.push(state)
      BaseFunctionary._stateCacheCount++
    }

    if (!this.throttledSendEvents) {
      this.throttledSendEvents = throttle(this.sendEvents, 10000, { leading: false })
      this.surfaceDelegate.addFlushListeners(this.throttledSendEvents.flush)
    }

    this.throttledSendEvents()

    if (this._fireOnNextEvent || BaseFunctionary._stateCacheCount === 300) {
      this._fireOnNextEvent = false
      this.throttledSendEvents.flush()
    }
  }

  private async sendEvents(): Promise<void> {
    const payload = BaseFunctionary._stateCache
    BaseFunctionary._stateCache = []
    BaseFunctionary._stateCacheCount = 0
    return this._call({ endpoint: '/state', payload })
  }

  private _call(
    requestOpts:
      | { endpoint: '/identify'; payload: FunctionaryIdentify }
      | { endpoint: '/state'; payload: FunctionaryStatePayload[] },
  ): Promise<void> {
    if (this.apikeyExists()) {
      const requestId = randomUUID()
      this._log(`${requestOpts.endpoint} request ${requestId} : ${JSON.stringify(requestOpts.payload)}`)
      return this._http({ ...requestOpts, requestId })
        .then(resp => {
          this._log(
            `${requestOpts.endpoint} response ${resp.headers['x-request-id'] || 'No ID'}: ${
              resp.status
            } ${JSON.stringify(resp.data)}`,
          )
        })
        .catch(err => {
          try {
            let mess
            if (err.response.status < 500) {
              mess = `${requestOpts.endpoint} response ${err.response.headers['x-request-id']} : ${
                (err as Error).message || 'There was an error'
              } \n data: ${JSON.stringify(err.response.data, null, 2)}`
            } else {
              mess = `${requestOpts.endpoint} response ${err.response.status} : ${
                (err as Error).message || 'There was an error'
              } \n - ${err.response.statusText}`
            }
            this._log(mess, 'error')
          } catch (e) {
            console.log(e)
          }
        })
    } else {
      const errMess =
        'Functionary API Key not set.  Try calling calling setApiKey(key: string) or set the env var FUNCTIONARY_API_KEY or NEXT_PUBLIC_FUNCTIONARY_API_KEY'
      this._log(errMess, 'error')
      return Promise.reject(errMess)
    }
  }

  private _http(
    requestOpts:
      | { endpoint: '/identify'; payload: FunctionaryIdentify; requestId: string }
      | { endpoint: '/state'; payload: FunctionaryStatePayload[]; requestId: string },
  ): Promise<AxiosResponse<any>> {
    const { endpoint, payload, requestId } = requestOpts
    if (this._stub) {
      return Promise.resolve({
        data: { ok: true },
        status: endpoint === '/identify' ? 200 : 202,
        statusText: '',
        headers: {},
        config: {
          method: 'POST',
          baseURL: this.baseURL,
          headers: {
            Authorization: `Bearer ${this.apikey}`,
            'Content-Type': 'application/json',
            'X-Request-Id': requestId,
            'X-Timezone-Offset': new Date().getTimezoneOffset() * 60 * 1000,
            'X-Source': 'client-js',
          },
        },
      })
    } else {
      return axios.post(`${endpoint}`, payload, {
        method: 'POST',
        baseURL: this.baseURL,
        timeout: 9000,
        headers: {
          Authorization: `Bearer ${this.apikey}`,
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
          'X-Timezone-Offset': new Date().getTimezoneOffset() * 60 * 1000,
          'X-Source': 'client-js',
        },
      })
    }
  }

  private static _indexOfEntityInCache(
    entity: FunctionaryEntity,
    cache: ({ model: FunctionarySupportedModel; ids: (string | number)[] } & any)[],
  ): number {
    const { ids: rawTargetIds, model: targetModel } = entity
    const targetIds = rawTargetIds.map(id => id.toString())
    for (let entInd = 0; entInd < cache.length; entInd++) {
      const { ids: searchIds, model: searchModel } = cache[entInd]
      if (targetModel === searchModel) {
        for (const searchId of searchIds) {
          if (targetIds.includes(searchId)) {
            return entInd
          }
        }
      }
    }
    return -1
  }
}
