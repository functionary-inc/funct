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
  FunctionaryState,
  Functionary,
  FunctionarySupportedModel,
} from '@funct/core'
import { useCallback, useEffect, useMemo } from 'react'

class ReactFunctionary extends BaseFunctionary {
  constructor(
    persistentType: 'both' | 'cookie' | 'localStorage',
    opts: { stub: boolean; debug: boolean; fireOnInstantiation: boolean; baseURL?: string },
  ) {
    const surfaceDelegate = new BrowserSurfaceDelegate(persistentType)
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
export const useFunctionary = (options?: {
  on?: boolean
  debug?: boolean
  fireOnInstantiation?: boolean
  persistentType?: 'both' | 'cookie' | 'localStorage'
  baseURL?: string
}): Functionary => {
  const functionary = useMemo<ReactFunctionary>(() => {
    const { on = true, debug = false, fireOnInstantiation = true, baseURL, persistentType = 'both' } = options || {}
    return new ReactFunctionary(persistentType, { stub: !on, debug, fireOnInstantiation, baseURL })
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

  const addProperties = useCallback(
    (model: FunctionarySupportedModel, properties: object) => functionary.addProperties(model, properties),
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
    addProperties,
    resetContext,
    assign,
    setApiKey,
  }
}
