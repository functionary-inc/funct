import {
  BaseFunctionary,
  BrowserSurfaceDelegate,
  Functionary,
  FunctionaryClientState,
  FunctionaryEntity,
  FunctionarySupportedModel,
} from '@funct/core'
export {
  FunctionaryIdentify,
  FunctionaryEntity,
  FunctionaryClientState,
  Functionary,
  FunctionarySupportedModel,
} from '@funct/core'
import { useCallback, useEffect, useMemo } from 'react'

class ReactFunctionary extends BaseFunctionary {
  constructor(opts: { stub: boolean; debug: boolean; fireOnInstantiation: boolean; baseURL?: string }) {
    const surfaceDelegate = new BrowserSurfaceDelegate()
    super(surfaceDelegate, opts)
  }
}

/**
 * @function useFunctionary - a hook that return Functionary convience methods
 *
 * @returns 5 functions.  See Below. 👇👇👇
 *
 * @function identify - Allows developers to identify customers and organizations.
 *
 * @function event - Allows developers to send events for customers and organizations.
 *
 * @function assign - Allows developers to assign a customer to an organization.
 *
 * @function resetContext - Allows developers wipe out the context specifically if a user logs out.
 *
 * @function setApiKey - set the API Key for your functionary workspace.
 *
 */
export const useFunctionary = (opts?: {
  on?: boolean
  debug?: boolean
  fireOnInstantiation?: boolean
  baseURL?: string
}): Functionary => {
  const functionary = useMemo<ReactFunctionary>(() => {
    const { on = true, debug = false, fireOnInstantiation = true, baseURL } = opts || {}
    return new ReactFunctionary({ stub: !on, debug, fireOnInstantiation, baseURL })
  }, [])

  useEffect(() => functionary.setupFromSurfaceDelegate(), [functionary])

  const identify = useCallback(
    (entity: FunctionaryEntity, opts: { setToContext?: boolean } = { setToContext: true }) =>
      functionary.identify(entity, opts),
    [functionary],
  )

  const resetContext = useCallback(
    (models: FunctionarySupportedModel[] = ['customer', 'organization']) => functionary.resetContext(models),
    [functionary],
  )

  const assign = useCallback(
    (customer: FunctionaryEntity, organization: FunctionaryEntity) => functionary.assign(customer, organization),
    [functionary],
  )

  const event = useCallback(
    (payload: FunctionaryClientState, opts: FunctionaryEntity | FunctionarySupportedModel = 'customer') =>
      functionary.event(payload, opts),
    [functionary],
  )

  const setApiKey = useCallback((apiKey: string) => functionary.setApiKey(apiKey), [functionary])

  return {
    event,
    identify,
    resetContext,
    assign,
    setApiKey,
  }
}
