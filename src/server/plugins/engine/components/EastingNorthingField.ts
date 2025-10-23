import { type EastingNorthingFieldComponent } from '@defra/forms-model'

import { LocationFieldBase } from '~/src/server/plugins/engine/components/LocationFieldBase.js'

export class EastingNorthingField extends LocationFieldBase {
  declare options: EastingNorthingFieldComponent['options']

  protected getValidationConfig() {
    return {
      pattern: /^(?:Easting:\s+)?(\d{6})\s*,\s*(?:Northing:\s+)?(\d{6})$/i,
      patternErrorMessage:
        'Enter easting and northing in the correct format, for example, Easting: 248741, Northing: 636880'
    }
  }

  protected getErrorTemplates() {
    return [
      {
        type: 'pattern',
        template:
          'Enter easting and northing in the correct format, for example, Easting: 248741, Northing: 636880'
      }
    ]
  }

  /**
   * Static version of getAllPossibleErrors that doesn't require a component instance.
   */
  static getAllPossibleErrors() {
    const instance = Object.create(
      EastingNorthingField.prototype
    ) as EastingNorthingField
    return instance.getAllPossibleErrors()
  }
}
