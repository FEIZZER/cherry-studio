import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { Field, FieldError, FieldLabel, Input } from '@cherrystudio/ui'

import type { ProviderImageEndpointDraft, ProviderImageEndpointDraftField } from '../utils/providerImageEndpoints'

interface ProviderImageEndpointFieldsProps {
  value: ProviderImageEndpointDraft
  invalidField?: ProviderImageEndpointDraftField | null
  onChange: (value: ProviderImageEndpointDraft) => void
}

export function ProviderImageEndpointFields({ value, invalidField, onChange }: ProviderImageEndpointFieldsProps) {
  const { t } = useTranslation()
  const uid = useId()
  const generationInputId = `${uid}-image-generation-base-url`
  const generationHelpId = `${uid}-image-generation-base-url-help`
  const generationErrorId = `${uid}-image-generation-base-url-error`
  const generationPathInputId = `${uid}-image-generation-request-path`
  const generationPathHelpId = `${uid}-image-generation-request-path-help`
  const editInputId = `${uid}-image-edit-base-url`
  const editHelpId = `${uid}-image-edit-base-url-help`
  const editErrorId = `${uid}-image-edit-base-url-error`
  const editPathInputId = `${uid}-image-edit-request-path`
  const editPathHelpId = `${uid}-image-edit-request-path-help`

  return (
    <div className="flex flex-col gap-4">
      <Field className="gap-2">
        <FieldLabel htmlFor={generationInputId} className="text-[13px] text-foreground">
          {t('settings.provider.image_endpoints.image_generation_base_url.label')}
        </FieldLabel>
        <Input
          id={generationInputId}
          value={value.imageGenerationBaseUrl}
          placeholder={t('settings.provider.base_url.placeholder')}
          aria-invalid={invalidField === 'imageGenerationBaseUrl'}
          aria-describedby={invalidField === 'imageGenerationBaseUrl' ? generationErrorId : generationHelpId}
          onChange={(event) => onChange({ ...value, imageGenerationBaseUrl: event.target.value })}
        />
        <p id={generationHelpId} className="text-xs leading-tight text-muted-foreground">
          {t('settings.provider.image_endpoints.image_generation_base_url.help')}
        </p>
        <FieldError
          id={generationErrorId}
          className="text-xs"
          errors={
            invalidField === 'imageGenerationBaseUrl'
              ? [{ message: t('settings.provider.base_url.invalid') }]
              : undefined
          }
        />
      </Field>

      <Field className="gap-2">
        <FieldLabel htmlFor={generationPathInputId} className="text-[13px] text-foreground">
          {t('settings.provider.image_endpoints.image_generation_request_path.label')}
        </FieldLabel>
        <Input
          id={generationPathInputId}
          value={value.imageGenerationRequestPath}
          placeholder={t('settings.provider.image_endpoints.image_generation_request_path.placeholder')}
          aria-describedby={generationPathHelpId}
          onChange={(event) => onChange({ ...value, imageGenerationRequestPath: event.target.value })}
        />
        <p id={generationPathHelpId} className="text-xs leading-tight text-muted-foreground">
          {t('settings.provider.image_endpoints.image_generation_request_path.help')}
        </p>
      </Field>

      <Field className="gap-2">
        <FieldLabel htmlFor={editInputId} className="text-[13px] text-foreground">
          {t('settings.provider.image_endpoints.image_edit_base_url.label')}
        </FieldLabel>
        <Input
          id={editInputId}
          value={value.imageEditBaseUrl}
          placeholder={t('settings.provider.base_url.placeholder')}
          aria-invalid={invalidField === 'imageEditBaseUrl'}
          aria-describedby={invalidField === 'imageEditBaseUrl' ? editErrorId : editHelpId}
          onChange={(event) => onChange({ ...value, imageEditBaseUrl: event.target.value })}
        />
        <p id={editHelpId} className="text-xs leading-tight text-muted-foreground">
          {t('settings.provider.image_endpoints.image_edit_base_url.help')}
        </p>
        <FieldError
          id={editErrorId}
          className="text-xs"
          errors={
            invalidField === 'imageEditBaseUrl' ? [{ message: t('settings.provider.base_url.invalid') }] : undefined
          }
        />
      </Field>

      <Field className="gap-2">
        <FieldLabel htmlFor={editPathInputId} className="text-[13px] text-foreground">
          {t('settings.provider.image_endpoints.image_edit_request_path.label')}
        </FieldLabel>
        <Input
          id={editPathInputId}
          value={value.imageEditRequestPath}
          placeholder={t('settings.provider.image_endpoints.image_edit_request_path.placeholder')}
          aria-describedby={editPathHelpId}
          onChange={(event) => onChange({ ...value, imageEditRequestPath: event.target.value })}
        />
        <p id={editPathHelpId} className="text-xs leading-tight text-muted-foreground">
          {t('settings.provider.image_endpoints.image_edit_request_path.help')}
        </p>
      </Field>
    </div>
  )
}
