import { type LatLongFieldComponent } from '@defra/forms-model'
import { type CustomHelpers, type ErrorReport } from 'joi'

import { LocationFieldBase } from '~/src/server/plugins/engine/components/LocationFieldBase.js'

export class LatLongField extends LocationFieldBase {
  declare options: LatLongFieldComponent['options']

  protected getValidationConfig() {
    const pattern =
      /^(?:Lat:\s+)?(-?\d+(?:\.\d+)?)\s*,\s*(?:Long:\s+)?(-?\d+(?:\.\d+)?)$/i

    return {
      pattern,
      patternErrorMessage:
        'Enter latitude and longitude in the correct format, for example, 51.5074, -0.1278',
      customValidation: (
        value: string,
        helpers: CustomHelpers
      ): string | ErrorReport => {
        const match = pattern.exec(value)
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
      },
      additionalMessages: {
        'custom.latitude':
          'Latitude must be between 49.850 and 60.859 for Great Britain',
        'custom.longitude':
          'Longitude must be between -13.687 and 1.767 for Great Britain'
      }
    }
  }

  protected getErrorTemplates() {
    return [
      {
        type: 'pattern',
        template:
          'Enter latitude and longitude in the correct format, for example, 51.5074, -0.1278'
      },
      {
        type: 'latitude',
        template: 'Latitude must be between 49.850 and 60.859 for Great Britain'
      },
      {
        type: 'longitude',
        template:
          'Longitude must be between -13.687 and 1.767 for Great Britain'
      }
    ]
  }

  /**
   * Static version of getAllPossibleErrors that doesn't require a component instance.
   */
  static getAllPossibleErrors() {
    const instance = Object.create(LatLongField.prototype) as LatLongField
    return instance.getAllPossibleErrors()
  }
}
