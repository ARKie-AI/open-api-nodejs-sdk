# ARKIE Open API Node.js SDK

中文 | [English](./docs/en/README.md)

## 安装
```bash
npm i @arkie/open-api
```
```bash
yarn add @arkie/open-api
```

## 快速上手

```ts
import {
  ArkieAPIClient,
  getTemplateById,
  createPosterByTemplateId,
  getPosterById,
  getPosters,
  deletePosterById,
} from '@arkie/open-api'

const client = new ArkieAPIClient('<你的 app key>', '<你的 app secret>')

// 获取模板
await getTemplateById(client, templateId)

// 创建海报
await createPosterByTemplateId(client, templateId, [
  {
    id: '<文本1的id>',
    type: 'text',
    text: 'ARKIE作图',
  },
  {
    id: '<图片1的id>',
    type: 'image',
    url: '<图片地址>',
    width: 1483,
    height: 532,
  },
])


// 查询海报
await getPosterById(client, posterId)

// 查询所有海报
await getPosters(client, { skip: 0, limit: 5 })

// 删除海报
await deletePosterById(client, posterId)
```
