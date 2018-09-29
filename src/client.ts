import { parse, format, UrlWithParsedQuery } from 'url'
import * as querystring from 'querystring'
import * as crypto from 'crypto'

import * as uuid from 'uuid'
import axios from 'axios'

const form = 'application/x-www-form-urlencoded'

interface Headers {
  [key: string]: string | undefined
}

export interface ArkieAPIOptions {
  signHeaders?: any
  headers?: Headers
  data?: any
  query?: any
  timeout?: number
}

export interface ArkieAPIError extends Error {
  isArkieAPIError: true
  code: number
  headers: any
  data: any
}

export class ArkieAPIClient {
  readonly appSecret: Buffer

  constructor(
    readonly appKey: string,
    appSecret: string,
    readonly stage: 'TEST' | 'PRE' | 'RELEASE' = 'RELEASE',
  ) {
    this.appSecret = Buffer.from(appSecret, 'utf8')
  }

  get<T = any>(url: string, opts: ArkieAPIOptions = {}) {
    const parsed = parse(url, true)
    const maybeQuery = opts.query || opts.data
    if (maybeQuery) {
      // append data into querystring
      Object.assign(parsed.query, maybeQuery)
      parsed.path = parsed.pathname + '?' + querystring.stringify(parsed.query)
      opts.data = null
      opts.query = null
    }

    // lowerify the header key
    opts.headers = loweredKeys(opts.headers)
    opts.signHeaders = loweredKeys(opts.signHeaders)

    return this.request<T>('GET', parsed, opts)
  }

  post<T = any>(url: string, opts: ArkieAPIOptions = {}) {
    const parsed = parse(url, true)
    const query = opts.query
    if (query) {
      // append data into querystring
      Object.assign(parsed.query, query)
      parsed.path = parsed.pathname + '?' + querystring.stringify(parsed.query)
      opts.query = null
    }

    // lowerify the header key
    opts.headers = loweredKeys(opts.headers)
    opts.signHeaders = loweredKeys(opts.signHeaders)

    const headers = opts.headers
    let type = headers['content-type'] || headers['Content-Type']
    if (!type) {
      type = headers['content-type'] = 'application/json'
    }

    const originData = opts.data
    if (type.startsWith('application/x-www-form-urlencoded')) {
      opts.data = querystring.stringify(opts.data)
    } else if (type.startsWith('application/json')) {
      opts.data = JSON.stringify(opts.data)
    } else if (!Buffer.isBuffer(opts.data) && typeof opts.data !== 'string') {
      opts.data = JSON.stringify(opts.data)
    }

    return this.request<T>('POST', parsed, opts, originData)
  }

  put<T = any>(url: string, opts: ArkieAPIOptions = {}) {
    const parsed = parse(url, true)
    const query = opts.query
    if (query) {
      // append data into querystring
      Object.assign(parsed.query, query)
      parsed.path = parsed.pathname + '?' + querystring.stringify(parsed.query)
      opts.query = null
    }

    // lowerify the header key
    opts.headers = loweredKeys(opts.headers)
    opts.signHeaders = loweredKeys(opts.signHeaders)

    const headers = opts.headers
    let type = headers['content-type'] || headers['Content-Type']
    if (!type) {
      type = headers['content-type'] = 'application/json'
    }

    const originData = opts.data
    if (type.startsWith('application/x-www-form-urlencoded')) {
      opts.data = querystring.stringify(opts.data)
    } else if (type.startsWith('application/json')) {
      opts.data = JSON.stringify(opts.data)
    } else if (!Buffer.isBuffer(opts.data) && typeof opts.data !== 'string') {
      opts.data = JSON.stringify(opts.data)
    }

    return this.request<T>('PUT', parsed, opts, originData)
  }

  delete<T = any>(url: string, opts: ArkieAPIOptions = {}) {
    const parsed = parse(url, true)
    const maybeQuery = opts.query || opts.data
    if (maybeQuery) {
      // append data into querystring
      Object.assign(parsed.query, maybeQuery)
      parsed.path = parsed.pathname + '?' + querystring.stringify(parsed.query)
      opts.data = null
      opts.query = null
    }

    // lowerify the header key
    opts.headers = loweredKeys(opts.headers)
    opts.signHeaders = loweredKeys(opts.signHeaders)

    return this.request<T>('DELETE', parsed, opts)
  }

  protected async request<T>(method: string, url: UrlWithParsedQuery, opts: ArkieAPIOptions = {}, originData?: any) {
    const { signHeaders } = opts
    // headers after lowercasing and merging
    const headers = this.buildHeaders(opts.headers, signHeaders)

    const requestContentType = headers['content-type'] || ''
    if (method === 'POST' && !requestContentType.startsWith(form)) {
      headers['content-md5'] = this.md5(opts.data)
    }

    const signHeaderKeys = this.getSignHeaderKeys(headers, signHeaders)
    headers['x-ca-signature-headers'] = signHeaderKeys.join(',')
    const signedHeadersStr = this.getSignedHeadersString(signHeaderKeys, headers)

    const stringToSign = this.buildStringToSign(method, headers, signedHeadersStr, url, originData)
    headers['x-ca-signature'] = this.sign(stringToSign)

    const response = await axios.request<T>({
      url: format(url),
      method: method,
      headers: headers,
      data: opts.data,
      timeout: opts.timeout
    })

    const code = response.status
    if (code >= 400) {
      const message = response.headers['x-ca-error-message'] || ''
      const err = new Error(`${method} ${format(url)} failed width code(${code}).` +
        ` request id: ${response.headers['x-ca-request-id']},` +
        ` error message: ${message}`) as ArkieAPIError
      err.isArkieAPIError = true
      err.code = code
      err.headers = response.headers
      err.data = response.data
      throw err
    }

    return response.data
  }

  protected buildStringToSign(method: string, headers: Headers, signedHeadersStr: string, url: UrlWithParsedQuery, data: any) {
    // accept, contentMD5, contentType,
    const lf = '\n'
    const list = [method, lf]

    for (const key of [
      'accept',
      'content-md5',
      'content-type',
      'date'
    ]) {
      const value = headers[key]
      if (value) {
        list.push(value)
      }
      list.push(lf)
    }

    if (signedHeadersStr) {
      list.push(signedHeadersStr)
      list.push(lf)
    }

    const contentType = headers['content-type']

    if (contentType && contentType.startsWith(form)) {
      list.push(this.buildUrl(url, data))
    } else {
      list.push(this.buildUrl(url))
    }

    return list.join('')
  }

  protected sign(stringToSign: string) {
    return crypto.createHmac('sha256', this.appSecret)
      .update(stringToSign, 'utf8').digest('base64')
  }

  protected md5(content: string) {
    return crypto.createHash('md5')
      .update(content, 'utf8')
      .digest('base64')
  }

  protected getSignHeaderKeys(headers: Headers, signHeaders: Headers) {
    const keys = Object.keys(headers).sort()
    const signKeys = []
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      // headers that starts with "x-ca-" or are specified
      if (key.startsWith('x-ca-') || signHeaders[key]) {
        signKeys.push(key)
      }
    }

    // sort by dictionary order
    return signKeys.sort()
  }

  protected buildUrl(parsedUrl: UrlWithParsedQuery, data?: any) {
    const toStringify = Object.assign(parsedUrl.query, data)
    let result = String(parsedUrl.pathname)
    if (Object.keys(toStringify).length) {
      const keys = Object.keys(toStringify).sort()
      const list = new Array(keys.length)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (toStringify[key]!==undefined && toStringify[key]!==null && ('' + toStringify[key])) {
          list[i] = `${key}=${toStringify[key]}`
        } else {
          list[i] = `${key}`
        }
      }
      result += '?' + list.join('&')
    }
    return result
  }

  protected buildHeaders(headers: any = {}, signHeaders: any = {}) {
    return Object.assign({
      'x-ca-timestamp': Date.now(),
      'x-ca-key': this.appKey,
      'x-ca-nonce': uuid.v4(),
      'x-ca-stage': this.stage,
      'accept': 'application/json'
    }, headers, signHeaders)
  }

  protected getSignedHeadersString(signHeaders: any, headers: any) {
    const list = []
    for (let i = 0; i < signHeaders.length; i++) {
      const key = signHeaders[i]
      list.push(key + ':' + headers[key])
    }

    return list.join('\n')
  }
}

function loweredKeys(headers = {}) {
  const lowered = {}

  const keys = Object.keys(headers)
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    lowered[key.toLowerCase()] = headers[key]
  }

  return lowered
}
