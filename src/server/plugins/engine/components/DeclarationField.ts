import { type DeclarationFieldComponent } from '@defra/forms-model'
import joi, { type BooleanSchema } from 'joi'

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

  declare schema: DeclarationFieldComponent['schema']

  declare declarationConfirmationLabel: string

  declare formSchema: BooleanSchema<string>
  declare stateSchema: BooleanSchema<string>
  declare content: string

  constructor(
    def: DeclarationFieldComponent,
    props: ConstructorParameters<typeof FormComponent>[1]
  ) {
    super(def, props)

    const { options, content } = def

    let formSchema = joi
      .boolean()
      .valid(true)
      .cast('string')
      .label(this.label)
      .required() as BooleanSchema<string>

    if (options.required === false) {
      formSchema = formSchema.optional()
    } else {
      formSchema = formSchema.messages({
        'any.required': messageTemplate.declarationRequired as string
      })
    }

    this.formSchema = formSchema.default(false)
    this.stateSchema = formSchema.default(false)
    this.options = options
    this.content = content
    this.declarationConfirmationLabel =
      options.declarationConfirmationLabel ?? this.DEFAULT_DECLARATION_LABEL
  }

  getFormValueFromState(state: FormSubmissionState) {
    const { name } = this
    return this.getFormValue(state[name])
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
