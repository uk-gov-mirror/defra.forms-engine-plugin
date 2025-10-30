import { type NationalGridFieldNumberFieldComponent } from '@defra/forms-model'
import type joi from 'joi'

import { LocationFieldBase } from '~/src/server/plugins/engine/components/LocationFieldBase.js'

export class NationalGridFieldNumberField extends LocationFieldBase {
  declare options: NationalGridFieldNumberFieldComponent['options']

  protected getValidationConfig() {
    return {
      // Pattern allows spaces and commas in the input since custom validation will clean them
      pattern: /^[A-Z]{2}[\d\s,]*$/i,
      patternErrorMessage: `Enter a valid National Grid field number for ${this.title} like NG 1234 5678`,
      customValidation: (value: string, helpers: joi.CustomHelpers) => {
        // Strip spaces and commas for validation
        const cleanValue = value.replace(/[\s,]/g, '')

        // Check if it matches the exact pattern after cleaning
        if (!/^[A-Z]{2}\d{8}$/i.test(cleanValue)) {
          return helpers.error('string.pattern.base')
        }

        // Format with spaces per GDS guidance: NG 1234 5678
        const letters = cleanValue.substring(0, 2)
        const numbers = cleanValue.substring(2)
        const formattedValue = `${letters} ${numbers.substring(0, 4)} ${numbers.substring(4)}`

        return formattedValue
      }
    }
  }

  protected getErrorTemplates() {
    return [
      {
        type: 'pattern',
        template:
          'Enter a valid National Grid field number for [short description] like NG 1234 5678'
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
