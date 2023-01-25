import { BaseFunctionary, Functionary as IFunctionary, NodeSurfaceDelegate } from '@funct/core'
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
  constructor(opts?: { apikey?: string; on?: boolean; debug?: boolean }) {
    const storageDelegate = new NodeSurfaceDelegate()

    const { on = true, debug = false, apikey } = opts || {}

    super(storageDelegate, { stub: on, debug, fireOnInstantiation: true })

    this.setupFromSurfaceDelegate()

    if (apikey) {
      this.apikey = apikey
    }
  }
}

/**
 * a prebuilt instance of the Functionary for convenience
 */
export const funct = new Functionary() as IFunctionary
