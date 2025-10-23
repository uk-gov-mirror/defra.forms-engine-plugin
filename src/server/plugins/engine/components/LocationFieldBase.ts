import joi, { type StringSchema } from 'joi'

import {
  FormComponent,
  isFormValue
} from '~/src/server/plugins/engine/components/FormComponent.js'
import { markdown } from '~/src/server/plugins/engine/components/helpers/components.js'
import { messageTemplate } from '~/src/server/plugins/engine/pageControllers/validationOptions.js'
import {
  type ErrorMessageTemplateList,
  type FormPayload,
  type FormState,
  type FormStateValue,
  type FormSubmissionError,
  type FormSubmissionState
} from '~/src/server/plugins/engine/types.js'

interface LocationFieldOptions {
  instructionText?: string
  required?: boolean
  customValidationMessage?: string
  customValidationMessages?: Record<string, string>
}

interface ValidationConfig {
  pattern: RegExp
  patternErrorMessage: string
  customValidation?: (
    value: string,
    helpers: joi.CustomHelpers
  ) => string | joi.ErrorReport
  additionalMessages?: Record<string, string>
}

/**
 * Abstract base class for location-based field components
 * Reduces code duplication across similar location field types
 */
export abstract class LocationFieldBase extends FormComponent {
  declare options: LocationFieldOptions
  declare formSchema: StringSchema
  declare stateSchema: StringSchema
  instructionText?: string

  protected abstract getValidationConfig(): ValidationConfig
  protected abstract getErrorTemplates(): Array<{
    type: string
    template: string
  }>

  constructor(def: any, props: ConstructorParameters<typeof FormComponent>[1]) {
    super(def, props)

    const { options } = def
    this.instructionText = options.instructionText

    const config = this.getValidationConfig()

    let formSchema = joi
      .string()
      .trim()
      .label(this.label)
      .required()
      .pattern(config.pattern)
      .messages({
        'string.pattern.base': config.patternErrorMessage,
        ...config.additionalMessages
      })

    if (config.customValidation) {
      formSchema = formSchema.custom(config.customValidation)
    }

    if (options.required === false) {
      formSchema = formSchema.allow('')
    }

    if (options.customValidationMessage) {
      const message = options.customValidationMessage
      const messageKeys = [
        'any.required',
        'string.empty',
        'string.pattern.base'
      ]

      if (config.additionalMessages) {
        messageKeys.push(...Object.keys(config.additionalMessages))
      }

      const messages = messageKeys.reduce(
        (acc, key) => {
          acc[key] = message
          return acc
        },
        {} as Record<string, string>
      )

      formSchema = formSchema.messages(messages)
    } else if (options.customValidationMessages) {
      formSchema = formSchema.messages(options.customValidationMessages)
    }

    this.formSchema = formSchema.default('')
    this.stateSchema = formSchema.default(null).allow(null)
    this.options = options
  }

  getFormValueFromState(state: FormSubmissionState) {
    const { name } = this
    return this.getFormValue(state[name])
  }

  getFormValue(value?: FormStateValue | FormState) {
    return this.isValue(value) ? value : undefined
  }

  isValue(value?: FormStateValue | FormState): value is string {
    return LocationFieldBase.isText(value)
  }

  getViewModel(payload: FormPayload, errors?: FormSubmissionError[]) {
    const viewModel = super.getViewModel(payload, errors)

    if (this.instructionText) {
      return {
        ...viewModel,
        instructionText: markdown.parse(this.instructionText, { async: false })
      }
    }

    return viewModel
  }

  getAllPossibleErrors(): ErrorMessageTemplateList {
    return {
      baseErrors: [
        { type: 'required', template: messageTemplate.required },
        ...this.getErrorTemplates()
      ],
      advancedSettingsErrors: []
    }
  }

  static isText(value?: FormStateValue | FormState): value is string {
    return isFormValue(value) && typeof value === 'string'
  }
}
