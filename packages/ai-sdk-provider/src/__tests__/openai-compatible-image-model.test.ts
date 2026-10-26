import type { ImageModelV3CallOptions } from '@ai-sdk/provider'
import { describe, expect, it, vi } from 'vitest'

import {
  createOpenAICompatibleImageModel,
  type OpenAICompatibleImageRequestPaths,
  mapOpenAICompatibleImagePath,
  normalizeImageRequestPath
} from '../openai-compatible-image-model'

const okImage = () =>
  new Response(JSON.stringify({ data: [{ b64_json: 'QUJD' }] }), { headers: { 'content-type': 'application/json' } })

const generationOptions = { prompt: 'a red circle', n: 1, providerOptions: {} } as ImageModelV3CallOptions
const editOptions = {
  ...generationOptions,
  files: [{ type: 'file', data: new Uint8Array([137, 80, 78, 71]), mediaType: 'image/png' }]
} as ImageModelV3CallOptions

function makeModel(imageRequestPaths?: OpenAICompatibleImageRequestPaths) {
  // A fresh Response per call: a single resolved instance has its body consumed by the first request.
  const fetchMock = vi.fn<(input: unknown, init?: RequestInit) => Promise<Response>>(async () => okImage())
  const model = createOpenAICompatibleImageModel('gpt-image-2', {
    name: 'my-relay',
    baseURL: 'https://relay.example.com/v1/',
    apiKey: 'sk-test',
    headers: { 'x-static': 'yes' },
    fetch: fetchMock,
    ...(imageRequestPaths ? { imageRequestPaths } : {})
  })
  return { model, fetchMock }
}

describe('mapOpenAICompatibleImagePath', () => {
  it('maps the OpenAI image suffixes onto the configured paths and normalizes them', () => {
    expect(mapOpenAICompatibleImagePath('/images/generations', { generation: 'predict' })).toBe('/predict')
    expect(mapOpenAICompatibleImagePath('/images/edits', { edit: '/images/modify' })).toBe('/images/modify')
  })

  it('keeps the default suffixes and non-image paths untouched', () => {
    const paths = { generation: '/predict' }
    expect(mapOpenAICompatibleImagePath('/images/generations', {})).toBe('/images/generations')
    expect(mapOpenAICompatibleImagePath('/images/edits', paths)).toBe('/images/edits')
    expect(mapOpenAICompatibleImagePath('/chat/completions', paths)).toBe('/chat/completions')
  })
})

describe('normalizeImageRequestPath', () => {
  it('treats blank values as unset and adds a leading slash', () => {
    expect(normalizeImageRequestPath('  ')).toBeUndefined()
    expect(normalizeImageRequestPath('predict')).toBe('/predict')
    expect(normalizeImageRequestPath('/predict')).toBe('/predict')
  })
})

describe('createOpenAICompatibleImageModel', () => {
  it('posts generations and edits to the configured request paths', async () => {
    const { model, fetchMock } = makeModel({ generation: 'predict', edit: '/images/modify' })

    await model.doGenerate(generationOptions)
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://relay.example.com/v1/predict')

    await model.doGenerate(editOptions)
    expect(String(fetchMock.mock.calls[1][0])).toBe('https://relay.example.com/v1/images/modify')
  })

  it('keeps the OpenAI suffix when a request path is not configured', async () => {
    const { model, fetchMock } = makeModel({ generation: '/predict' })

    await model.doGenerate(generationOptions)
    expect(String(fetchMock.mock.calls[0][0])).toBe('https://relay.example.com/v1/predict')

    await model.doGenerate(editOptions)
    expect(String(fetchMock.mock.calls[1][0])).toBe('https://relay.example.com/v1/images/edits')
  })

  it('still authenticates and forwards headers on custom paths', async () => {
    const { model, fetchMock } = makeModel({ generation: '/predict' })

    await model.doGenerate(generationOptions)

    const headers = new Headers((fetchMock.mock.calls[0][1] as RequestInit).headers)
    expect(headers.get('Authorization')).toBe('Bearer sk-test')
    expect(headers.get('x-static')).toBe('yes')
  })
})
