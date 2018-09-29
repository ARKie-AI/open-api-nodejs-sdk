export interface Payload<T> {
  data: T
  errors: never[]
}

export namespace ARKIE {
  /**
   * 模板
   */
  export interface Template {
    /**
     * 模板的id
     */
    id: string
    /**
     * 模板的预览图
     */
    previewImageUrl: string
    /**
     * 模板的尺寸
     */
    size: Size
    /**
     * 模板中可以替换的元素
     */
    substitutableElements: SubstitutableElement[]
    /**
     * 创建时间
     */
    createdAt: string
    /**
     * 最后一次更新时间
     */
    updatedAt: string
  }

  /**
   * 模板/海报尺寸
   */
  export interface Size {
    /**
     * 宽度
     */
    width: number
    /**
     * 高度
     */
    height: number
    /**
     * 尺寸单位
     */
    unit: 'px'
  }

  /**
   * 海报
   */
  export interface Poster {
    /**
     * 海报id
     */
    id: string
    /**
     * 模板id
     */
    templateId: string
    /**
     * 海报的预览图
     */
    url: string
    /**
     * 海报的尺寸
     */
    size: Size
    /**
     * 创建时间
     */
    createdAt: string
    /**
     * 最后一次更新时间
     */
    updatedAt: string
  }

  /**
   * 可替换元素
   */
  export type SubstitutableElement =
    | SubstitutableTextElement
    | SubstitutableImageElement

  /**
   * 可替换文本元素
   */
  export interface SubstitutableTextElement {
    /**
     * 元素类型
     */
    type: 'text'
    /**
     * 元素id
     */
    id: string
    /**
     * 文本内容
     */
    text: string
  }

  /**
   * 可替换图片元素
   */
  export interface SubstitutableImageElement {
    /**
     * 元素类型
     */
    type: 'image'
    /**
     * 元素id
     */
    id: string
    /**
     * 图片链接
     */
    url: string
  }

  /**
   * 可替换元素输入
   */
  export type SubstitutableElementInput =
    | SubstitutableTextElementInput
    | SubstitutableImageElementInput

  /**
   * 可替换文本元素输入
   */
  export interface SubstitutableTextElementInput {
    /**
     * 元素类型
     */
    type: 'text'
    /**
     * 元素id
     */
    id: string
    /**
     * 文本内容
     */
    text: string
  }

  /**
   * 可替换图片元素输入
   */
  export interface SubstitutableImageElementInput {
    /**
     * 元素类型
     */
    type: 'image'
    /**
     * 元素id
     */
    id: string
    /**
     * 图片链接
     */
    url: string
    /**
     * 图片宽
     */
    width: number
    /**
     * 图片高
     */
    height: number
  }
}
