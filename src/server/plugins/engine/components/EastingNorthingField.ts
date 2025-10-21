import { type EastingNorthingFieldComponent } from '@defra/forms-model'
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

export class EastingNorthingField extends FormComponent {
  declare options: EastingNorthingFieldComponent['options']
  declare formSchema: StringSchema
  declare stateSchema: StringSchema
  instructionText?: string

  constructor(
    def: EastingNorthingFieldComponent,
    props: ConstructorParameters<typeof FormComponent>[1]
  ) {
    super(def, props)

    const { options } = def
    this.instructionText = options.instructionText

    let formSchema = joi
      .string()
      .trim()
      .label(this.label)
      .required()
      // Pattern for Easting and Northing coordinates
      // Accepts formats like: "Easting: 248741, Northing: 63688" or "248741, 63688"
      .pattern(/^(?:Easting:\s*)?(\d{6}),?\s*(?:Northing:\s*)?(\d{6})$/i)
      .messages({
        'string.pattern.base':
          'Enter easting and northing in the correct format, for example, Easting: 248741, Northing: 63688'
      })

    if (options.required === false) {
      formSchema = formSchema.allow('')
    }

    if (options.customValidationMessage) {
      const message = options.customValidationMessage

      formSchema = formSchema.messages({
        'any.required': message,
        'string.empty': message,
        'string.pattern.base': message
      })
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
    return EastingNorthingField.isText(value)
  }

  getViewModel(payload: FormPayload, errors?: FormSubmissionError[]) {
    const viewModel = super.getViewModel(payload, errors)

    // Add instruction text to the component for rendering
    if (this.instructionText) {
      return {
        ...viewModel,
        instructionText: markdown.parse(this.instructionText, { async: false })
      }
    }

    return viewModel
  }

  /**
   * For error preview page that shows all possible errors on a component
   */
  getAllPossibleErrors(): ErrorMessageTemplateList {
    return EastingNorthingField.getAllPossibleErrors()
  }

  /**
   * Static version of getAllPossibleErrors that doesn't require a component instance.
   */
  static getAllPossibleErrors(): ErrorMessageTemplateList {
    return {
      baseErrors: [
        { type: 'required', template: messageTemplate.required },
        {
          type: 'pattern',
          template:
            'Enter easting and northing in the correct format, for example, Easting: 248741, Northing: 63688'
        }
      ],
      advancedSettingsErrors: []
    }
  }

  static isText(value?: FormStateValue | FormState): value is string {
    return isFormValue(value) && typeof value === 'string'
  }
}
