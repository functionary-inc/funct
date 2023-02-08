import {
  BaseFunctionary,
  BrowserSurfaceDelegate,
  Functionary,
  FunctionaryClientState,
  FunctionaryEntity,
  FunctionarySupportedModel,
  Person,
  Group,
} from '@funct/core'
export {
  FunctionaryIdentify,
  FunctionaryEntity,
  FunctionaryClientState,
  FunctionaryState,
  FunctionaryStatePayload,
  Functionary,
  FunctionarySupportedModel,
  Person,
  Group,
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
 * @instance person - Allows developers to identify customers and organizations.
 *
 * @instance group - Allows developers to identify customers and organizations.
 *
 * @function setApiKey - set the API Key for your functionary workspace.
 *
 */
export const useFunctionary = (options?: {
  on?: boolean
  debug?: boolean
  fireOnInstantiation?: boolean
  setToCacheByDefault?: boolean
  persistentType?: 'both' | 'cookie' | 'localStorage'
  baseURL?: string
}): { person: Person; group: Group; setApiKey: (apiKey: string) => void } => {
  const { person, group, functionary } = useMemo<{
    group: Group
    person: Person
    functionary: ReactFunctionary
  }>(() => {
    const {
      on = true,
      debug = false,
      fireOnInstantiation = true,
      baseURL,
      persistentType = 'both',
      setToCacheByDefault = true,
    } = options || {}
    const functionary = new ReactFunctionary(persistentType, { stub: !on, debug, fireOnInstantiation, baseURL })
    const person = new Person(functionary, setToCacheByDefault)
    const group = new Group(functionary, setToCacheByDefault)
    return { person, group, functionary }
  }, [])

  useEffect(() => functionary.setupFromSurfaceDelegate(), [functionary])

  const setApiKey = useCallback((apiKey: string) => functionary.setApiKey(apiKey), [functionary])

  return {
    person,
    group,
    setApiKey,
  }
}
