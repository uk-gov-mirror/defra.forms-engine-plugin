import {
  type FormMetadata,
  type SubmitResponsePayload
} from '@defra/forms-model'

import { type checkFormStatus } from '~/src/server/plugins/engine/helpers.js'
import { type FormModel } from '~/src/server/plugins/engine/models/FormModel.js'
import { type DetailItem } from '~/src/server/plugins/engine/models/types.js'
import {
  format as machineV2,
  type RichFormValue
} from '~/src/server/plugins/engine/outputFormatters/machine/v2.js'
import { FormAdapterSubmissionSchemaVersion } from '~/src/server/plugins/engine/types/enums.js'
import {
  type FormAdapterSubmissionMessageData,
  type FormAdapterSubmissionMessagePayload,
  type FormContext
} from '~/src/server/plugins/engine/types.js'
import { FormStatus } from '~/src/server/routes/types.js'

interface CsvFiles {
  main?: string
  repeaters: Record<string, string>
}

interface TransformedData
  extends Omit<FormAdapterSubmissionMessageData, 'repeaters'> {
  repeaters: Record<string, { state: Record<string, RichFormValue> }[]>
}

interface AdapterPayload {
  meta: FormAdapterSubmissionMessagePayload['meta']
  data: TransformedData
  result: {
    files: CsvFiles
  }
}

export function format(
  context: FormContext,
  items: DetailItem[],
  model: FormModel,
  submitResponse: SubmitResponsePayload,
  formStatus: ReturnType<typeof checkFormStatus>,
  formMetadata?: FormMetadata
): string {
  const v2DataString = machineV2(
    context,
    items,
    model,
    submitResponse,
    formStatus
  )
  const v2DataParsed = JSON.parse(v2DataString) as {
    data: FormAdapterSubmissionMessageData
  }

  const csvFiles = extractCsvFiles(submitResponse)

  const transformedData = transformRepeaters(v2DataParsed.data)

  const payload: AdapterPayload = {
    meta: {
      schemaVersion: FormAdapterSubmissionSchemaVersion.V1,
      timestamp: new Date(),
      referenceNumber: context.referenceNumber,
      formName: model.name,
      formId: formMetadata?.id ?? '',
      formSlug: formMetadata?.slug ?? '',
      status: formStatus.isPreview ? FormStatus.Draft : FormStatus.Live,
      isPreview: formStatus.isPreview,
      notificationEmail: formMetadata?.notificationEmail ?? ''
    },
    data: transformedData,
    result: {
      files: csvFiles
    }
  }

  return JSON.stringify(payload)
}

function extractCsvFiles(submitResponse: SubmitResponsePayload): CsvFiles {
  const result = submitResponse.result as {
    files?: {
      main?: string
      repeaters?: Record<string, string>
    }
  }

  return {
    main: result.files?.main,
    repeaters: result.files?.repeaters ?? {}
  }
}

function transformRepeaters(
  data: FormAdapterSubmissionMessageData
): TransformedData {
  const transformedData: TransformedData = {
    ...data,
    repeaters: {}
  }

  Object.entries(data.repeaters).forEach(([repeaterName, items]) => {
    transformedData.repeaters[repeaterName] = items.map((item) => ({
      state: item
    }))
  })

  return transformedData
}
