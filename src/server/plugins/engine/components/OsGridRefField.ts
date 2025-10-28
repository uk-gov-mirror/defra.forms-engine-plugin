import { type OsGridRefFieldComponent } from '@defra/forms-model'
import type joi from 'joi'

import { LocationFieldBase } from '~/src/server/plugins/engine/components/LocationFieldBase.js'

export class OsGridRefField extends LocationFieldBase {
  declare options: OsGridRefFieldComponent['options']

  protected getValidationConfig() {
    // Regex for OS grid references and parcel IDs
    // Validates specific valid OS grid letter combinations and either:
    // - 2 blocks of 4 digits (parcel ID) e.g., ST 6789 6789
    // - 2 blocks of 5 digits (OS grid reference) e.g., SO 12345 12345
    const osGridPattern =
      /^((([sS]|[nN])[a-hA-Hj-zJ-Z])|(([tT]|[oO])[abfglmqrvwABFGLMQRVW])|([hH][l-zL-Z])|([jJ][lmqrvwLMQRVW]))\s?(([0-9]{4})\s?([0-9]{4})|([0-9]{5})\s?([0-9]{5}))$/

    // More permissive pattern for initial validation (allows spaces to be cleaned)
    const initialPattern = /^[A-Za-z]{2}[\d\s]*$/

    return {
      pattern: initialPattern,
      patternErrorMessage: `Enter a valid OS grid reference for ${this.title} like TQ123456`,
      customValidation: (value: string, helpers: joi.CustomHelpers) => {
        // Strip spaces from the input
        const cleanValue = value.replace(/\s/g, '')

        // Check if it matches the OS grid pattern
        // We need to test with spaces in the right places for validation
        const valueWithSpaces = value.trim()

        if (!osGridPattern.test(valueWithSpaces)) {
          // Also try without any spaces (e.g., TQ12345678)
          const letters = cleanValue.substring(0, 2)
          const numbers = cleanValue.substring(2)

          if (numbers.length === 8 || numbers.length === 10) {
            // Format with spaces for validation: XX 1234 5678 or XX 12345 67890
            const halfLength = numbers.length / 2
            const formattedValue = `${letters} ${numbers.substring(0, halfLength)} ${numbers.substring(halfLength)}`

            if (!osGridPattern.test(formattedValue)) {
              return helpers.error('string.pattern.base')
            }
          } else {
            return helpers.error('string.pattern.base')
          }
        }

        // Return the cleaned value without spaces for storage
        return cleanValue
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
