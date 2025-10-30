import { type OsGridRefFieldComponent } from '@defra/forms-model'
import type joi from 'joi'

import { LocationFieldBase } from '~/src/server/plugins/engine/components/LocationFieldBase.js'

export class OsGridRefField extends LocationFieldBase {
  declare options: OsGridRefFieldComponent['options']

  protected getValidationConfig() {
    // Regex for OS grid references and parcel IDs
    // Validates specific valid OS grid letter combinations with:
    // - 6 digits (e.g., SD865005 or SD 865 005)
    // - 8 digits in 2 blocks of 4 (parcel ID) e.g., ST 6789 6789
    // - 10 digits in 2 blocks of 5 (OS grid reference) e.g., SO 12345 12345
    const osGridPattern =
      /^(?:[sn][a-hj-z]|[to][abfglmqrvw]|h[l-z]|j[lmqrvw])\s?(?:\d{3}\s?\d{3}|\d{4}\s?\d{4}|\d{5}\s?\d{5})$/i

    // More permissive pattern for initial validation (allows spaces to be cleaned)
    const initialPattern = /^[A-Za-z]{2}[\d\s]*$/

    return {
      pattern: initialPattern,
      patternErrorMessage: `Enter a valid OS grid reference for ${this.title} like TQ123456`,
      customValidation: (value: string, helpers: joi.CustomHelpers) => {
        // Strip spaces from the input for processing
        const cleanValue = value.replace(/\s/g, '')
        const letters = cleanValue.substring(0, 2)
        const numbers = cleanValue.substring(2)

        // Validate number length
        if (
          numbers.length !== 6 &&
          numbers.length !== 8 &&
          numbers.length !== 10
        ) {
          return helpers.error('string.pattern.base')
        }

        // Format with spaces: XX 123 456, XX 1234 5678, or XX 12345 67890
        const halfLength = numbers.length / 2
        const formattedValue = `${letters} ${numbers.substring(0, halfLength)} ${numbers.substring(halfLength)}`

        // Validate the formatted value against the OS grid pattern
        if (!osGridPattern.test(formattedValue)) {
          return helpers.error('string.pattern.base')
        }

        // Return formatted value with spaces per GDS guidance
        return formattedValue
      }
    }
  }

  protected getErrorTemplates() {
    return [
      {
        type: 'pattern',
        template:
          'Enter a valid OS grid reference for [short description] like TQ123456'
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
