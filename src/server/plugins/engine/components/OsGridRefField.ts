import { type OsGridRefFieldComponent } from '@defra/forms-model'
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

export class OsGridRefField extends FormComponent {
  declare options: OsGridRefFieldComponent['options']
  declare formSchema: StringSchema
  declare stateSchema: StringSchema
  instructionText?: string

  constructor(
    def: OsGridRefFieldComponent,
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
      // Pattern for OS Grid Reference: 2 letters followed by 10 numbers
      .pattern(/^[A-Z]{2}\d{10}$/i)
      .messages({
        'string.pattern.base':
          'Enter an OS grid reference in the correct format, for example, SO7394301364'
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
    return OsGridRefField.isText(value)
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
    return OsGridRefField.getAllPossibleErrors()
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
            'Enter an OS grid reference in the correct format, for example, SO7394301364'
        }
      ],
      advancedSettingsErrors: []
    }
  }

  static isText(value?: FormStateValue | FormState): value is string {
    return isFormValue(value) && typeof value === 'string'
  }
}
