import {
  BaseFunctionary,
  BrowserSurfaceDelegate,
  FunctionaryIdentify,
  Functionary,
  FunctionaryState,
  FunctionaryEntity,
} from '@funct/core'
export { FunctionaryIdentify, FunctionaryState, Functionary } from '@funct/core'
import { useCallback, useEffect, useMemo } from 'react'

class ReactFunctionary extends BaseFunctionary {
  constructor(opts: { stub: boolean; debug: boolean; fireOnInstantiation: boolean }) {
    const storageDelegate = new BrowserSurfaceDelegate()
    super(storageDelegate, opts)
  }
}

/**
 * @function useFunctionary - a hook that return Functionary convience methods
 *
 * @returns 4 useful functions.  See Below. 👇👇👇
 *
 * @function identify - calls the identify endpoint of Functionary.
 *
 * @function event - calls the identify endpoint of Functionary.
 *
 * @function setApiKey - set the API Key for your functionary workspace.
 *
 * @function setBaseUrl - Define the base url for sending the identify and event calls.
 *
 */
export const useFunctionary = (opts?: {
  on?: boolean
  debug?: boolean
  fireOnInstantiation?: boolean
}): Functionary => {
  const functionary = useMemo<ReactFunctionary>(() => {
    const { on = true, debug = false, fireOnInstantiation = true } = opts || {}
    return new ReactFunctionary({ stub: !on, debug, fireOnInstantiation })
  }, [])

  useEffect(() => functionary.setupFromSurfaceDelegate(['customer', 'organization']), [functionary])

  const event = useCallback(
    async (payload: FunctionaryState, model: string) => await functionary.event(payload, model),
    [functionary],
  )

  const setApiKey = useCallback((apiKey: string) => functionary.setApiKey(apiKey), [functionary])

  const setBaseUrl = useCallback((baseURL: string) => functionary.setBaseUrl(baseURL), [functionary])

  const identify = useCallback(
    async (payload: FunctionaryIdentify) => await functionary.identify(payload),
    [functionary],
  )

  return {
    event,
    identify,
    setBaseUrl,
    setApiKey,
  }
}
