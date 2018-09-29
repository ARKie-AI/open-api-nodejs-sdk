import { ArkieAPIClient } from './client'
import { Payload, ARKIE } from './types'

/**
 * 通过id获取单张模板
 *
 * Retrieve single template by its id
 * @param client api客户端
 * @param templateId 模板id
 */
export function getTemplateById(client: ArkieAPIClient, templateId: string) {
  const url = `http://api.arkie.cn/v1/template/${encodeURIComponent(templateId)}`
  return client.get<Payload<ARKIE.Template>>(url)
}

/**
 * 通过模板id和可替换元素创建海报
 *
 * Generate single poster given templateId and substitutable elements
 * @param client api客户端
 * @param templateId 模板id
 * @param substitutableElements 可替换元素输入列表
 */
export function createPosterByTemplateId(client: ArkieAPIClient, templateId: string, substitutableElements: ARKIE.SubstitutableElementInput[]) {
  const url = `http://api.arkie.cn/v1/poster`
  return client.post<Payload<ARKIE.Poster>>(url, {
    data: {
      id: templateId,
      items: substitutableElements,
    },
  })
}

/**
 * 获取海报列表
 *
 * Retrive all posters
 * @param client api客户端
 * @param query
 */
export function getPosters(client: ArkieAPIClient, query: { skip?: number, limit?: number } = {}) {
  const url = `http://api.arkie.cn/v1/poster`
  return client.get<Payload<GetPostersPayload>>(url, { data: query })
}

/**
 * 获取海报列表返回结果
 */
export interface GetPostersPayload {
  count: number
  skip: number
  limit: number
  /**
   * 海报列表
   */
  results: ARKIE.Poster[]
}

/**
 * 通过id获取单张海报
 *
 * Retrieve single poster by its id
 * @param client api客户端
 * @param posterId 海报id
 */
export function getPosterById(client: ArkieAPIClient, posterId: string) {
  const url = `http://api.arkie.cn/v1/poster/${encodeURIComponent(posterId)}`
  return client.get<Payload<ARKIE.Poster>>(url)
}

/**
 * 通过id删除单张海报
 *
 * Delete single poster by its id
 * @param client api客户端
 * @param posterId 海报id
 */
export function deletePosterById(client: ArkieAPIClient, posterId: string) {
  const url = `http://api.arkie.cn/v1/poster/${encodeURIComponent(posterId)}`
  return client.delete<''>(url)
}
