import { type FormComponentsDef } from '@defra/forms-model'
import joi, { type ObjectSchema } from 'joi'

import { type FormRequestPayload } from '../../types/index.js'

import { getRoutes } from './routes.js'

import {
  FormComponent,
  isFormValue
} from '~/src/server/plugins/engine/components/FormComponent.js'
import { messageTemplate } from '~/src/server/plugins/engine/pageControllers/validationOptions.js'
import {
  type ErrorMessageTemplateList,
  type FormState,
  type FormStateValue,
  type FormSubmissionState
} from '~/src/server/plugins/engine/types.js'

export class CustomerReferenceField extends FormComponent {
  declare options: CustomerReferenceFieldComponent['options']

  declare schema: CustomerReferenceFieldComponent['schema']

  declare formSchema: ObjectSchema
  declare stateSchema: ObjectSchema

  constructor(
    def: CustomerReferenceFieldComponent,
    props: ConstructorParameters<typeof FormComponent>[1]
  ) {
    super(def, props)

    const { options } = def
    const schema = 'schema' in def ? def.schema : {}

    this.formSchema = joi.string().required()
    this.stateSchema = joi
      .object()
      .keys({
        reference: joi.string().required(),
        _id: joi.string().required()
      })
      .required()
    this.options = options
    this.schema = schema
  }

  getFormValueFromState(state: FormSubmissionState) {
    const { name } = this
    return this.getFormValue(state[name])
  }

  getFormValue(value?: FormStateValue | FormState) {
    return this.isValue(value) ? value.reference : undefined
  }

  isValue(value?: FormStateValue | FormState): value is CustomerReferenceState {
    return CustomerReferenceField.isCustomerReferenceField(value)
  }

  // getFormDataFromState(state: FormSubmissionState): FormPayload {
  //   const { collection, name } = this

  //   if (collection) {
  //     return collection.getFormDataFromState(state)
  //   }

  //   return {
  //     [name]: this.getFormValue(state[name])
  //   }
  // }

  /**
   * For error preview page that shows all possible errors on a component
   */
  getAllPossibleErrors(): ErrorMessageTemplateList {
    return CustomerReferenceField.getAllPossibleErrors()
  }

  /**
   * Static version of getAllPossibleErrors that doesn't require a component instance.
   */
  static getAllPossibleErrors(): ErrorMessageTemplateList {
    return {
      baseErrors: [{ type: 'required', template: messageTemplate.required }],
      advancedSettingsErrors: [
        { type: 'min', template: messageTemplate.min },
        { type: 'max', template: messageTemplate.max }
      ]
    }
  }

  static isCustomerReferenceField(
    value?: FormStateValue | FormState
  ): value is CustomerReferenceState {
    return value !== null && typeof value === 'object' && '_id' in value
  }

  getRoutes() {
    return {
      routes: getRoutes(),
      entrypoint: '/customer-reference-field/confirm'
    }
  }
}

export interface CustomerReferenceFieldComponent extends FormComponentsDef {
  id?: string
  type: 'CustomerReferenceField'
  shortDescription?: string
  name: string
  title: string
  hint?: string
  options: object
  schema: object
}

interface CustomerReferenceState {
  _id: string
  reference: string
}
