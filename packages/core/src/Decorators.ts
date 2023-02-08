import { BaseFunctionary, Functionary, FunctionaryEntity, FunctionarySupportedModel } from '.'

export interface FunctionaryDecorator {
  /**
   * @function identify - calls the identify endpoint of Functionary. NOTE: All API calls are batched in 10 second increments.
   *
   * @param {(string | number)[]} ids - __REQUIRED__ The properties, ids, and model of the person or group to identify.
   *
   * @param {{ setToCache?: boolean }} opts - options for this function.  If `setToCache = true`,
   * then the person or group will be set to the current cache, functionary will automatically set fired events
   * to the person or group on the cache.  Useful if a user is logged in.
   *
   * @example ```
   * // calls the identify endpoint with model and id set. will set person to cache depending on the
   * // default behavior of the surface. react sets the identified person by default. Node does not.
   * person.identify(["some-ids"])
   * // calls the identify endpoit without setting the identified person
   * // useful if you are sending an event for a user that is NOT logged in, or you are using on a backend
   * // where the many users will share the same cache
   * person.identify(["some-ids"], { setToCache: false })
   * ```
   */
  identify: (ids: (string | number)[], opts?: { setToCache?: boolean }) => void
  /**
   * @function track - calls the event endpoint of Functionary. NOTE: All API calls are batched in 10 second increments.
   *
   * @param {string} event - __REQUIRED__ the name of the event to track
   *
   * @param {{ eventProperties?: object; ids?: (string | number)[] }} opts -  `ids` allows you to specify the person or group
   * on which an event will be assigned. `eventProperties` allows you to assign properties to the events.
   *
   * @example ```
   * // Uses the person set on the cache.
   * person.track("sign_up")
   * // Uses the person with the ids in the Arr of the ids
   * person.track({ name: "sign_up" }, { ids: ["some-id"] } )
   * ```
   */
  track: (event: string, opts?: { properties?: object; ids?: (string | number)[] }) => void
  /**
   * @function set - allows developer to add a property to the person or group on the cache.  Only
   * works with the person set on the cache.
   *
   * @param {object} properties - __REQUIRED__ The dictionary of products to add to the person or group
   *
   * @example ```
   * // Uses the person set on the cache.
   * person.set({ aprop: "theValue" })
   * ```
   */
  set: (properties: object) => void
  /**
   * @function reset - allows developer to wipe out the cache, specifically when a user logs out.
   *
   * @param {FunctionarySupportedModel[]} models - sets which models to revoke the cache from.
   * By default, its both `['person', 'group']`
   *
   * @example ```
   * // By default, its both `['person', 'group']`
   * person.reset()
   * ```
   */
  reset: () => void
  /**
   * @function group - allows developer to assign a person to an group. NOT AVAIL ON A GROUP.
   *
   * @param {(string | number)[]} groupIds - __REQUIRED__ The ids if the group.  This should always be a "groupIds".
   *
   * @param {(string | number)[]} personIds - The ids if the person.  This should always be a "person". If
   * not specified, will try to use the cache.
   *
   * @example ```
   * // Uses the person set on the cache.
   * person.group(['some-group-id'])
   * ```
   */
  group?: (groupIds: (string | number)[], personIds?: (string | number)[]) => void
}

abstract class BaseEntity implements FunctionaryDecorator {
  protected model: FunctionarySupportedModel
  protected functionary: Functionary
  protected setToCacheByDefault: boolean

  constructor(functionary: Functionary, model: FunctionarySupportedModel, setToCacheByDefault: boolean) {
    this.setToCacheByDefault = setToCacheByDefault
    this.functionary = functionary
    this.model = model
  }

  identify(ids: (string | number)[], opts?: { setToCache?: boolean }) {
    const defaultOpts = this.setToCacheByDefault ? { setToCache: true } : { setToCache: false }
    this.functionary.identify({ model: this.model, ids }, opts || defaultOpts)
  }

  set(properties: object) {
    this.functionary.addProperties(properties, this.model)
  }

  track(event: string, opts?: { properties?: object; ids?: (string | number)[] }) {
    let entIdentification
    if (opts && opts.ids) {
      entIdentification = { model: this.model, ids: opts.ids }
    } else {
      entIdentification = this.model
    }
    this.functionary.event({ name: event, properties: opts?.properties || undefined }, entIdentification)
  }

  reset() {
    this.functionary.resetContext([this.model])
  }
}

export class Person extends BaseEntity {
  constructor(functionary: Functionary, setToCacheByDefault: boolean) {
    super(functionary, 'person', setToCacheByDefault)
  }

  /**
   * @function group - allows developer to assign a person to an group. NOT AVAIL ON A GROUP.
   *
   * @param {(string | number)[]} groupIds - __REQUIRED__ The ids if the group.  This should always be a "groupIds".
   *
   * @param {(string | number)[]} personIds - The ids if the person.  This should always be a "person". If
   * not specified, will try to use the cache.
   *
   * @example ```
   * // Uses the person set on the cache.
   * person.group(['some-group-id'])
   * ```
   */
  group(groupIds: (string | number)[], personIds?: (string | number)[]) {
    this.functionary.identify({ model: 'group', ids: groupIds }, { setToCache: false })
    this.functionary.assign(
      { model: 'group', ids: groupIds },
      personIds ? { model: this.model, ids: personIds } : undefined,
    )
  }
}

export class Group extends BaseEntity {
  constructor(functionary: Functionary, setToCacheByDefault: boolean) {
    super(functionary, 'group', setToCacheByDefault)
  }
}
