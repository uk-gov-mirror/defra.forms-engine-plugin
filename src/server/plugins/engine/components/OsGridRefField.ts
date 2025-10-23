import { type OsGridRefFieldComponent } from '@defra/forms-model'

import { LocationFieldBase } from '~/src/server/plugins/engine/components/LocationFieldBase.js'

export class OsGridRefField extends LocationFieldBase {
  declare options: OsGridRefFieldComponent['options']

  protected getValidationConfig() {
    return {
      pattern: /^[A-Z]{2}\d{10}$/i,
      patternErrorMessage:
        'Enter an OS grid reference in the correct format, for example, SO7394301364'
    }
  }

  protected getErrorTemplates() {
    return [
      {
        type: 'pattern',
        template:
          'Enter an OS grid reference in the correct format, for example, SO7394301364'
      }
    ]
  }

  /**
   * Static version of getAllPossibleErrors that doesn't require a component instance.
   */
  static getAllPossibleErrors() {
    const instance = Object.create(OsGridRefField.prototype) as OsGridRefField
    return instance.getAllPossibleErrors()
  }
}
