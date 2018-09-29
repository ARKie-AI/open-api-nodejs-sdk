# ARKIE Open API Node.js SDK

[中文](../../README.md) | English

## Installation
```bash
npm i @arkie-ai/open-api
```
```bash
yarn add @arkie-ai/open-api
```

## Quick Start

```ts
import {
  ArkieAPIClient,
  getTemplateById,
  createPosterByTemplateId,
  getPosterById,
  getPosters,
  deletePosterById,
} from '@arkie-ai/open-api'

const client = new ArkieAPIClient('<your app key>', '<your app secret>')

// retrieve template
await getTemplateById(client, templateId)

// create poster
await createPosterByTemplateId(client, templateId, [
  {
    id: '<id of text1>',
    type: 'text',
    text: 'ARKIE',
  },
  {
    id: '<image of text1>',
    type: 'image',
    url: '<image url>',
    width: 1483,
    height: 532,
  },
])


// retrieve poster
await getPosterById(client, posterId)

// retrieve all posters
await getPosters(client, { skip: 0, limit: 5 })

// delete poster
await deletePosterById(client, posterId)
```
