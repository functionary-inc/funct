import { BaseFunctionary, Functionary as IFunctionary, ServerStorageDelegate } from '@funct/core'
export { FunctionaryIdentify, FunctionaryState } from '@funct/core'

/**
 * Describes a Functionary object.
 *
 * @constructor
 * @param opts \{ apikey?: string; on?: boolean } - __OPTIONAL__ Options to instantiate a Functionary object
 *
 * @example ```
 * // apikey pulls from process.env.FUNCTIONARY_API_KEY
 * // or process.env.NEXT_PUBLIC_FUNCTIONARY_API_KEY
 * // on defaults true
 * const funct = new Functionary()
 * ```
 *
 * @example ```
 * const funct = new Functionary({
 *   on: process.env.NODE_ENV === 'production',
 *   apikey: 'YOUR_API_KEY'
 * })
 * ```
 */
export class Functionary extends BaseFunctionary implements IFunctionary {
  constructor(opts?: { apikey?: string; on?: boolean }) {
    const storageDelegate = new ServerStorageDelegate()

    if (opts && opts.on) {
      super(storageDelegate, { stub: !opts.on })
    } else {
      super(storageDelegate, { stub: false })
    }

    this.setupFromStorageDelegate()

    if (opts && opts.apikey) {
      this.apikey = opts.apikey
    }
  }
}

/**
 * a prebuilt instance of the Functionary for convenience
 */
export const funct = new Functionary() as IFunctionary
