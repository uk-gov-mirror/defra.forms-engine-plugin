import { type LatLongFieldComponent } from '@defra/forms-model'
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

export class LatLongField extends FormComponent {
  declare options: LatLongFieldComponent['options']
  declare formSchema: StringSchema
  declare stateSchema: StringSchema
  instructionText?: string

  constructor(
    def: LatLongFieldComponent,
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
      // Pattern for latitude and longitude - flexible format
      // Accepts: "51.5074, -0.1278" or "51.5074,-0.1278" or "Lat: 51.5074, Long: -0.1278"
      .pattern(
        /^(?:Lat:?\s*)?(-?\d+(?:\.\d+)?),?\s*(?:Lon(?:g)?:?\s*)?(-?\d+(?:\.\d+)?)$/i
      )
      .custom((value, helpers) => {
        const match = value.match(
          /^(?:Lat:?\s*)?(-?\d+(?:\.\d+)?),?\s*(?:Lon(?:g)?:?\s*)?(-?\d+(?:\.\d+)?)$/i
        )
        if (match) {
          const latitude = Number.parseFloat(match[1])
          const longitude = Number.parseFloat(match[2])

          // Validate Great Britain ranges
          if (latitude < 49.85 || latitude > 60.859) {
            return helpers.error('custom.latitude')
          }
          if (longitude < -13.687 || longitude > 1.767) {
            return helpers.error('custom.longitude')
          }
        }
        return value
      })
      .messages({
        'string.pattern.base':
          'Enter latitude and longitude in the correct format, for example, 51.5074, -0.1278',
        'custom.latitude':
          'Latitude must be between 49.850 and 60.859 for Great Britain',
        'custom.longitude':
          'Longitude must be between -13.687 and 1.767 for Great Britain'
      })

    if (options.required === false) {
      formSchema = formSchema.allow('')
    }

    if (options.customValidationMessage) {
      const message = options.customValidationMessage

      formSchema = formSchema.messages({
        'any.required': message,
        'string.empty': message,
        'string.pattern.base': message,
        'custom.latitude': message,
        'custom.longitude': message
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
    return LatLongField.isText(value)
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
    return LatLongField.getAllPossibleErrors()
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
            'Enter latitude and longitude in the correct format, for example, 51.5074, -0.1278'
        },
        {
          type: 'latitude',
          template:
            'Latitude must be between 49.850 and 60.859 for Great Britain'
        },
        {
          type: 'longitude',
          template:
            'Longitude must be between -13.687 and 1.767 for Great Britain'
        }
      ],
      advancedSettingsErrors: []
    }
  }

  static isText(value?: FormStateValue | FormState): value is string {
    return isFormValue(value) && typeof value === 'string'
  }
}
