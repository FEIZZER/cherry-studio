import { describe, expect, it } from 'vitest'

import { ENDPOINT_TYPE } from '@shared/data/types/model'

import {
  findInvalidProviderImageEndpointDraft,
  mergeProviderImageEndpointDraft,
  readProviderImageEndpointDraft
} from '../providerImageEndpoints'

describe('provider image endpoint drafts', () => {
  it('stores generation and editing URLs and request paths independently', () => {
    expect(
      mergeProviderImageEndpointDraft(undefined, {
        imageGenerationBaseUrl: ' https://generate.example.com ',
        imageGenerationRequestPath: ' predict ',
        imageEditBaseUrl: ' https://edit.example.com ',
        imageEditRequestPath: ''
      })
    ).toEqual({
      [ENDPOINT_TYPE.OPENAI_IMAGE_GENERATION]: { baseUrl: 'https://generate.example.com', requestPath: 'predict' },
      [ENDPOINT_TYPE.OPENAI_IMAGE_EDIT]: { baseUrl: 'https://edit.example.com' }
    })
  })

  it('leaves blank image endpoints unset so requests can fall back to the provider Base URL', () => {
    const existing = {
      [ENDPOINT_TYPE.ANTHROPIC_MESSAGES]: { baseUrl: 'https://api.example.com' }
    }

    expect(
      mergeProviderImageEndpointDraft(existing, {
        imageGenerationBaseUrl: '',
        imageGenerationRequestPath: '',
        imageEditBaseUrl: '',
        imageEditRequestPath: ''
      })
    ).toEqual(existing)
  })

  it('preserves endpoint metadata when a draft is read and merged without changes', () => {
    const existing = {
      [ENDPOINT_TYPE.OPENAI_IMAGE_GENERATION]: {
        baseUrl: 'https://generate.example.com',
        requestPath: '/predict',
        adapterFamily: 'openai-compatible'
      }
    }
    const draft = readProviderImageEndpointDraft(existing)

    expect(draft).toEqual({
      imageGenerationBaseUrl: 'https://generate.example.com',
      imageGenerationRequestPath: '/predict',
      imageEditBaseUrl: '',
      imageEditRequestPath: ''
    })
    expect(mergeProviderImageEndpointDraft(existing, draft)).toEqual(existing)
  })

  it('clears only the edited image endpoint while preserving the other endpoint', () => {
    const existing = {
      [ENDPOINT_TYPE.OPENAI_IMAGE_GENERATION]: { baseUrl: 'https://generate.example.com' },
      [ENDPOINT_TYPE.OPENAI_IMAGE_EDIT]: { baseUrl: 'https://edit.example.com' }
    }

    expect(
      mergeProviderImageEndpointDraft(existing, {
        imageGenerationBaseUrl: '',
        imageGenerationRequestPath: '',
        imageEditBaseUrl: 'https://edit.example.com',
        imageEditRequestPath: ''
      })
    ).toEqual({
      [ENDPOINT_TYPE.OPENAI_IMAGE_EDIT]: { baseUrl: 'https://edit.example.com' }
    })
  })

  it('clears a request path without dropping the endpoint', () => {
    const existing = {
      [ENDPOINT_TYPE.OPENAI_IMAGE_GENERATION]: {
        baseUrl: 'https://generate.example.com',
        requestPath: '/predict'
      }
    }

    expect(
      mergeProviderImageEndpointDraft(existing, {
        imageGenerationBaseUrl: 'https://generate.example.com',
        imageGenerationRequestPath: '',
        imageEditBaseUrl: '',
        imageEditRequestPath: ''
      })
    ).toEqual({
      [ENDPOINT_TYPE.OPENAI_IMAGE_GENERATION]: { baseUrl: 'https://generate.example.com' }
    })
  })

  it('reports only non-empty invalid URLs', () => {
    expect(
      findInvalidProviderImageEndpointDraft({
        imageGenerationBaseUrl: 'not-a-url',
        imageGenerationRequestPath: '',
        imageEditBaseUrl: '',
        imageEditRequestPath: ''
      })
    ).toBe('imageGenerationBaseUrl')
    expect(
      findInvalidProviderImageEndpointDraft({
        imageGenerationBaseUrl: '',
        imageGenerationRequestPath: '',
        imageEditBaseUrl: 'ftp://edit.example.com',
        imageEditRequestPath: ''
      })
    ).toBe('imageEditBaseUrl')
  })
})
