import { isEmpty, trim } from 'es-toolkit/compat'

import { validateApiHost } from '@renderer/utils/api'
import { ENDPOINT_TYPE, type EndpointType } from '@shared/data/types/model'
import type { EndpointConfig } from '@shared/data/types/provider'

export interface ProviderImageEndpointDraft {
  imageGenerationBaseUrl: string
  imageGenerationRequestPath: string
  imageEditBaseUrl: string
  imageEditRequestPath: string
}

export type ProviderImageEndpointDraftField = 'imageGenerationBaseUrl' | 'imageEditBaseUrl'

type EndpointConfigField = 'baseUrl' | 'requestPath'

function setEndpointConfigField(
  endpointConfigs: Partial<Record<EndpointType, EndpointConfig>>,
  type: EndpointType,
  field: EndpointConfigField,
  fieldValue: string
) {
  const value = trim(fieldValue)
  if (value) {
    endpointConfigs[type] = { ...endpointConfigs[type], [field]: value }
    return
  }

  const remainingConfig = { ...endpointConfigs[type] }
  delete remainingConfig[field]
  if (isEmpty(remainingConfig)) {
    delete endpointConfigs[type]
  } else {
    endpointConfigs[type] = remainingConfig
  }
}

export function readProviderImageEndpointDraft(
  endpointConfigs: Partial<Record<EndpointType, EndpointConfig>> | undefined
): ProviderImageEndpointDraft {
  const generation = endpointConfigs?.[ENDPOINT_TYPE.OPENAI_IMAGE_GENERATION]
  const edit = endpointConfigs?.[ENDPOINT_TYPE.OPENAI_IMAGE_EDIT]

  return {
    imageGenerationBaseUrl: trim(generation?.baseUrl ?? ''),
    imageGenerationRequestPath: trim(generation?.requestPath ?? ''),
    imageEditBaseUrl: trim(edit?.baseUrl ?? ''),
    imageEditRequestPath: trim(edit?.requestPath ?? '')
  }
}

export function mergeProviderImageEndpointDraft(
  existing: Partial<Record<EndpointType, EndpointConfig>> | undefined,
  draft: ProviderImageEndpointDraft
): Partial<Record<EndpointType, EndpointConfig>> {
  const endpointConfigs: Partial<Record<EndpointType, EndpointConfig>> = { ...existing }

  setEndpointConfigField(
    endpointConfigs,
    ENDPOINT_TYPE.OPENAI_IMAGE_GENERATION,
    'baseUrl',
    draft.imageGenerationBaseUrl
  )
  setEndpointConfigField(
    endpointConfigs,
    ENDPOINT_TYPE.OPENAI_IMAGE_GENERATION,
    'requestPath',
    draft.imageGenerationRequestPath
  )
  setEndpointConfigField(endpointConfigs, ENDPOINT_TYPE.OPENAI_IMAGE_EDIT, 'baseUrl', draft.imageEditBaseUrl)
  setEndpointConfigField(endpointConfigs, ENDPOINT_TYPE.OPENAI_IMAGE_EDIT, 'requestPath', draft.imageEditRequestPath)

  return endpointConfigs
}

export function findInvalidProviderImageEndpointDraft(
  draft: ProviderImageEndpointDraft
): ProviderImageEndpointDraftField | null {
  const imageGenerationBaseUrl = trim(draft.imageGenerationBaseUrl)
  if (imageGenerationBaseUrl && !validateApiHost(imageGenerationBaseUrl)) {
    return 'imageGenerationBaseUrl'
  }

  const imageEditBaseUrl = trim(draft.imageEditBaseUrl)
  if (imageEditBaseUrl && !validateApiHost(imageEditBaseUrl)) {
    return 'imageEditBaseUrl'
  }

  return null
}
