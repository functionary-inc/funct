import { BaseFunctionary, Functionary as IFunctionary, NodeSurfaceDelegate } from '@funct/core'
export { FunctionaryIdentify, FunctionaryState } from '@funct/core'

/**
 * Describes a Functionary object.
 *
 * @constructor
 * @param opts- __OPTIONAL__ Options to instantiate a Functionary object
 * ```
 * {
 *   apikey?: string
 *   on?: boolean
 *   debug?: boolean
 *   fireOnInstantiation?: boolean
 *   baseURL?: string
 * }
 * ```
 *
 * @example ```
 * // apikey pulls from process.env.FUNCTIONARY_API_KEY
 * // or process.env.NEXT_PUBLIC_FUNCTIONARY_API_KEY
 * const funct = new Functionary()
 * ```
 *
 * @example ```
 * const funct = new Functionary({
 *   on: process.env.NODE_ENV === 'production',
 *   debug: true,
 *   fireOnInstantiation: true,
 *   baseURL: 'https://functionary.run/api/v1',
 *   apikey: 'YOUR_API_KEY'
 * })
 * ```
 */
export class Functionary extends BaseFunctionary implements IFunctionary {
  constructor(opts?: {
    apikey?: string
    on?: boolean
    debug?: boolean
    fireOnInstantiation?: boolean
    baseURL?: string
  }) {
    const storageDelegate = new NodeSurfaceDelegate()

    const { on = true, debug = false, fireOnInstantiation = true, baseURL, apikey } = opts || {}

    super(storageDelegate, { stub: !on, debug, fireOnInstantiation, baseURL })

    this.setupFromSurfaceDelegate()

    if (apikey) {
      this.apikey = apikey
    }
  }
}

/**
 * a prebuilt instance of the Functionary for convenience
 */
export const functionary = new Functionary() as IFunctionary
