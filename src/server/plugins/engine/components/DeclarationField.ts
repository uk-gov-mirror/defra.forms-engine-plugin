import { type DeclarationFieldComponent } from '@defra/forms-model'
import joi, { type BooleanSchema, type StringSchema } from 'joi'

import {
  FormComponent,
  isFormValue
} from '~/src/server/plugins/engine/components/FormComponent.js'
import { messageTemplate } from '~/src/server/plugins/engine/pageControllers/validationOptions.js'
import {
  type ErrorMessageTemplateList,
  type FormPayload,
  type FormState,
  type FormStateValue,
  type FormSubmissionError,
  type FormSubmissionState,
  type FormValue
} from '~/src/server/plugins/engine/types.js'

export class DeclarationField extends FormComponent {
  private readonly DEFAULT_DECLARATION_LABEL = 'I understand and agree'

  declare options: DeclarationFieldComponent['options']

  declare declarationConfirmationLabel: string

  declare formSchema: StringSchema
  declare stateSchema: BooleanSchema
  declare content: string

  constructor(
    def: DeclarationFieldComponent,
    props: ConstructorParameters<typeof FormComponent>[1]
  ) {
    super(def, props)

    const { options, content } = def

    let checkboxSchema = joi.string().valid('true')

    if (options.required !== false) {
      checkboxSchema = checkboxSchema.required()
    }

    const formSchema = joi
      .array()
      .items(checkboxSchema, joi.string().valid('unchecked').strip())
      .label(this.label)
      .single()
      .messages({
        'any.required': messageTemplate.declarationRequired as string,
        'any.unknown': messageTemplate.declarationRequired as string,
        'array.includesRequiredUnknowns':
          messageTemplate.declarationRequired as string
      }) as StringSchema

    this.formSchema = formSchema
    this.stateSchema = joi.boolean().cast('string').label(this.label).required()

    this.options = options
    this.content = content
    this.declarationConfirmationLabel =
      options.declarationConfirmationLabel ?? this.DEFAULT_DECLARATION_LABEL
  }

  getFormValueFromState(state: FormSubmissionState) {
    const { name } = this
    return state[name] === true ? 'true' : undefined
  }

  getFormDataFromState(state: FormSubmissionState): FormPayload {
    const { name } = this
    const test = { [name]: state[name] === true ? 'true' : undefined }
    return test
  }

  getStateFromValidForm(payload: FormPayload): FormState {
    const { name } = this
    const value = payload[name] === 'true'
    return { [name]: value }
  }

  getFormValue(value?: FormStateValue | FormState) {
    return this.isValue(value) ? value : undefined
  }

  getDisplayStringFromFormValue(value: FormValue | FormPayload): string {
    return value ? this.declarationConfirmationLabel : ''
  }

  getViewModel(payload: FormPayload, errors?: FormSubmissionError[]) {
    const defaultDeclarationConfirmationLabel =
      'I confirm that I understand and accept this declaration'
    const {
      title,
      hint,
      content,
      declarationConfirmationLabel = defaultDeclarationConfirmationLabel
    } = this
    return {
      ...super.getViewModel(payload, errors),
      hint: hint && { text: hint },
      fieldset: {
        legend: {
          text: title
        }
      },
      content,
      values: payload[this.name] === 'true' ? ['true'] : [],
      items: [
        {
          text: declarationConfirmationLabel,
          value: 'true'
        }
      ]
    }
  }

  isValue(value?: FormStateValue | FormState): value is boolean {
    return DeclarationField.isBool(value)
  }

  /**
   * For error preview page that shows all possible errors on a component
   */
  getAllPossibleErrors(): ErrorMessageTemplateList {
    return DeclarationField.getAllPossibleErrors()
  }

  /**
   * Static version of getAllPossibleErrors that doesn't require a component instance.
   */
  static getAllPossibleErrors(): ErrorMessageTemplateList {
    return {
      baseErrors: [
        { type: 'required', template: messageTemplate.declarationRequired }
      ],
      advancedSettingsErrors: []
    }
  }

  static isBool(value?: FormStateValue | FormState): value is boolean {
    return isFormValue(value) && typeof value === 'boolean'
  }
}
