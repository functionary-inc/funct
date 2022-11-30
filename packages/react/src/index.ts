import {
  BaseFunctionary,
  BrowserStorageDelegate,
  FunctionaryIdentify,
  Functionary,
  FunctionaryEvent,
} from '@funct/core'
export { FunctionaryIdentify, FunctionaryEvent, Functionary } from '@funct/core'
import { useCallback, useEffect, useMemo } from 'react'

class ReactFunctionary extends BaseFunctionary {
  constructor() {
    const storageDelegate = new BrowserStorageDelegate()
    super(storageDelegate, fetch)
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
export const useFunctionary = (): Functionary => {
  const functionary = useMemo<ReactFunctionary>(() => {
    return new ReactFunctionary()
  }, [])

  useEffect(() => {
    functionary.setupFromStorageDelegate()
  }, [functionary])

  const event = useCallback(
    async (payload: FunctionaryEvent) => {
      await functionary.event(payload)
    },
    [functionary],
  )

  const setApiKey = useCallback(
    async (apiKey: string) => {
      await functionary.setApiKey(apiKey)
    },
    [functionary],
  )

  const setBaseUrl = useCallback(
    async (baseURL: string) => {
      await functionary.setBaseUrl(baseURL)
    },
    [functionary],
  )

  const identify = useCallback(
    async (payload: FunctionaryIdentify) => {
      await functionary.identify(payload)
    },
    [functionary],
  )

  return {
    event,
    identify,
    setBaseUrl,
    setApiKey,
  }
}
