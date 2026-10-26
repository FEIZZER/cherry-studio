import { OpenAICompatibleImageModel, type OpenAICompatibleProviderSettings, VERSION } from '@ai-sdk/openai-compatible'
import type { ImageModelV3 } from '@ai-sdk/provider'
import { withUserAgentSuffix, withoutTrailingSlash } from '@ai-sdk/provider-utils'

/**
 * Per-operation request paths that replace the OpenAI image suffixes the SDK
 * appends to the Base URL (`/images/generations`, `/images/edits`).
 */
export interface OpenAICompatibleImageRequestPaths {
  /** Replaces the `/images/generations` suffix. */
  generation?: string
  /** Replaces the `/images/edits` suffix. */
  edit?: string
}

export interface OpenAICompatibleImageModelSettings extends OpenAICompatibleProviderSettings {
  imageRequestPaths?: OpenAICompatibleImageRequestPaths
}

const IMAGE_GENERATION_PATH = '/images/generations'
const IMAGE_EDIT_PATH = '/images/edits'

/** Normalize a user-entered request path to a `/`-prefixed suffix; empty ⇒ unset. */
export function normalizeImageRequestPath(path: string | undefined): string | undefined {
  const trimmed = path?.trim()
  if (!trimmed) return undefined
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

/** Map the SDK's default image suffixes onto the configured request paths. */
export function mapOpenAICompatibleImagePath(path: string, requestPaths: OpenAICompatibleImageRequestPaths): string {
  if (path === IMAGE_GENERATION_PATH) return normalizeImageRequestPath(requestPaths.generation) ?? path
  if (path === IMAGE_EDIT_PATH) return normalizeImageRequestPath(requestPaths.edit) ?? path
  return path
}

/**
 * `createOpenAICompatible().imageModel()` bakes the OpenAI image suffixes into
 * its `url` callback. When a provider configures custom request paths, rebuild
 * the image model with the same request config and a `url` that maps the default
 * suffixes onto them. Mirrors the SDK's `getCommonModelConfig('image')`.
 */
export function createOpenAICompatibleImageModel(
  modelId: string,
  settings: OpenAICompatibleImageModelSettings
): ImageModelV3 {
  const baseURL = withoutTrailingSlash(settings.baseURL)
  const headers = {
    ...(settings.apiKey && { Authorization: `Bearer ${settings.apiKey}` }),
    ...settings.headers
  }
  return new OpenAICompatibleImageModel(modelId, {
    provider: `${settings.name}.image`,
    url: ({ path }) => {
      const url = new URL(`${baseURL}${mapOpenAICompatibleImagePath(path, settings.imageRequestPaths ?? {})}`)
      if (settings.queryParams) {
        url.search = new URLSearchParams(settings.queryParams).toString()
      }
      return url.toString()
    },
    headers: () => withUserAgentSuffix(headers, `ai-sdk/openai-compatible/${VERSION}`),
    fetch: settings.fetch
  })
}
