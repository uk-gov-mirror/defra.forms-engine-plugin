import { type NationalGridFieldNumberFieldComponent } from '@defra/forms-model'

import { LocationFieldBase } from '~/src/server/plugins/engine/components/LocationFieldBase.js'

export class NationalGridFieldNumberField extends LocationFieldBase {
  declare options: NationalGridFieldNumberFieldComponent['options']

  protected getValidationConfig() {
    return {
      pattern: /^[A-Z]{2}\d{8}$/i,
      patternErrorMessage:
        'Enter a National Grid field number in the correct format, for example, SO04188589'
    }
  }

  protected getErrorTemplates() {
    return [
      {
        type: 'pattern',
        template:
          'Enter a National Grid field number in the correct format, for example, SO04188589'
      }
    ]
  }

  /**
   * Static version of getAllPossibleErrors that doesn't require a component instance.
   */
  static getAllPossibleErrors() {
    const instance = Object.create(
      NationalGridFieldNumberField.prototype
    ) as NationalGridFieldNumberField
    return instance.getAllPossibleErrors()
  }
}
