import nodeFetch from 'node-fetch';
/**
 * Interface for payload expected by the `identify` endpoint.
 * See for detailed explination of params => https://docs.functionary.run/identify
 *
 * @interface
 */
export interface FunctionaryIdentify {
  model: string;
  ids: (string | number)[];
  // Not Required, but rec for the first /identify
  displayName?: string;
  // situationally applicable
  properties?: object;
  childIds?: (string | number)[];
  childModel?: string;
  parentIds?: (string | number)[];
  parentModel?: string;
}

/**
 * Interface for payload expected by the `events` endpoint.
 * See for detailed explination of params => https://docs.functionary.run/events
 *
 * @interface
 */
export interface FunctionaryEvent {
  model?: string;
  ids: (string | number)[];
  name: string;
  // situationally applicable
  properties?: object;
}

/**
 * Creates a new Functionary.
 * @constructor
 */
class Functionary {
  private _fetch;
  private _apikey: string;
  private _baseURL: string;

  constructor(opts: { apikey: string; baseURL?: string }) {
    const { apikey, baseURL = 'https://functionary.run/api/v1/' } = opts;
    if (!!window && !!window.fetch) {
      this._fetch = window.fetch;
    } else {
      this._fetch = nodeFetch;
    }
    this._baseURL = baseURL;
    this._apikey = apikey;
  }

  async identify(payload: FunctionaryIdentify) {
    return await this._fetch(`${this._baseURL}identify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this._apikey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  async event(payload: FunctionaryEvent) {
    return await this._fetch(`${this._baseURL}event`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this._apikey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }
}

export default Functionary;
