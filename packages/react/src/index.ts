import { Functionary } from '@funct/core'
import { FunctionaryIdentify, FunctionaryEvent } from '@funct/core'
export { FunctionaryIdentify, FunctionaryEvent } from '@funct/core'

const singleton = new Functionary({ surface: 'browser' })

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
export const useFunctionary = (): {
  setApiKey: (apiKey: string) => void
  setBaseUrl: (url: string) => void
  identify: (payload: FunctionaryIdentify) => Promise<void>
  event: (payload: FunctionaryEvent) => Promise<void>
} => {
  const { setApiKey, setBaseUrl, identify, event } = singleton
  return {
    /**
     * @function setApiKey - set the API Key for your functionary workspace.
     *
     * @param {string} apiKey - api key as a string
     */
    setApiKey,
    /**
     * @function setBaseUrl - Define the base url for sending the identify and event calls.
     *
     * @param {string} url - url formatted as '(https|http)://{{domain}}.{{TLD}}/', for example, http://example.com/
     */
    setBaseUrl,
    /**
     * @function identify - calls the identify endpoint of Functionary.
     *
     * @param {FunctionaryIdentify} payload - The payload of the Functionary identify POST request.
     * See the FunctionaryIdentify interface for typing infor ->
     * `import { FunctionaryIdentify } from "@funct/core"`.
     */
    identify,
    /**
     * @function event - calls the identify endpoint of Functionary.
     *
     * @param {FunctionaryEvent} payload - The payload of the Functionary event POST request. See the
     * FunctionaryEvent interface for typing infor -> `import { FunctionaryEvent } from "@funct/core"`.
     */
    event,
  }
}
