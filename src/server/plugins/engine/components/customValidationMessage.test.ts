import {
  ComponentType,
  isFormType,
  type ComponentDef
} from '@defra/forms-model'

import { ComponentCollection } from '~/src/server/plugins/engine/components/ComponentCollection.js'
import { FormModel } from '~/src/server/plugins/engine/models/FormModel.js'
import {
  type FormPayload,
  type FormValue
} from '~/src/server/plugins/engine/types.js'
import { listString } from '~/test/fixtures/list.js'
import definition from '~/test/form/definitions/blank.js'
import { getFormData } from '~/test/helpers/component-helpers.js'

/**
 * Checks `options.customValidationMessage` for every form component type,
 * with and without a translator. A real request always passes a translator.
 */

const CUSTOM = 'This is a custom validation message'
const OVERRIDE = { customValidationMessage: CUSTOM }

/**
 * Component types that use options.customValidationMessage
 */
const SUPPORTED_COMPONENT_TYPES = [
  ComponentType.TextField,
  ComponentType.EmailAddressField,
  ComponentType.MultilineTextField,
  ComponentType.TelephoneNumberField,
  ComponentType.NumberField,
  ComponentType.OsGridRefField,
  ComponentType.NationalGridFieldNumberField,
  ComponentType.YesNoField
]

/**
 * Component types that ignore options.customValidationMessage
 */
const NOT_SUPPORTED_COMPONENT_TYPES = [
  ComponentType.CheckboxesField,
  ComponentType.DatePartsField,
  ComponentType.MonthYearField,
  ComponentType.EastingNorthingField,
  ComponentType.LatLongField,
  ComponentType.UkAddressField,
  ComponentType.FileUploadField,
  ComponentType.DeclarationField,
  ComponentType.HiddenField,
  ComponentType.GeospatialField,
  ComponentType.PaymentField,
  ComponentType.RadiosField,
  ComponentType.SelectField,
  ComponentType.AutocompleteField,
  ComponentType.TrackingField
]

/**
 * Definition fields for each type, where they differ from the defaults in
 * `buildComponent()`
 */
const EXTRA_DEFINITION_FIELDS: Partial<
  Record<ComponentType, { options?: object; [key: string]: unknown }>
> = {
  [ComponentType.MultilineTextField]: { schema: {} },
  [ComponentType.NumberField]: { schema: {} },
  [ComponentType.FileUploadField]: { schema: {} },
  [ComponentType.RadiosField]: { list: 'listString' },
  [ComponentType.SelectField]: { list: 'listString' },
  [ComponentType.AutocompleteField]: { list: 'listString' },
  [ComponentType.CheckboxesField]: { list: 'listString' },
  [ComponentType.DeclarationField]: { content: 'Lorem ipsum dolar sit amet' },
  [ComponentType.PaymentField]: {
    options: { amount: 100, description: 'Test payment description' }
  }
}

/**
 * Form input for each type, where it differs from `getFormData()`. Each
 * input gives a validation error.
 */
const INPUTS: Partial<Record<ComponentType, FormPayload>> = {
  [ComponentType.DeclarationField]: getFormData(['unchecked']),
  [ComponentType.PaymentField]: getFormData({
    paymentId: '',
    reference: '',
    amount: 0,
    description: '',
    uuid: '',
    formId: '',
    isLivePayment: false
  } as unknown as FormValue)
}

/**
 * Build a component definition for a type, with extra options merged in
 */
function buildComponent(type: ComponentType, options = {}) {
  const fields = EXTRA_DEFINITION_FIELDS[type]

  return {
    title: 'Example field',
    name: 'myComponent',
    type,
    ...fields,
    options: { ...fields?.options, ...options }
  } as ComponentDef
}

/**
 * Get form input for a type
 */
function getInput(type: ComponentType) {
  return INPUTS[type] ?? getFormData()
}

describe('Component-level validation message override (customValidationMessage)', () => {
  // Fails when a new form ComponentType is not in one of the two lists above.
  it('accounts for every form ComponentType', () => {
    const accountedFor = [
      ...SUPPORTED_COMPONENT_TYPES,
      ...NOT_SUPPORTED_COMPONENT_TYPES
    ]

    expect(new Set(accountedFor).size).toBe(accountedFor.length)
    expect([...accountedFor].sort()).toEqual(
      Object.values(ComponentType).filter(isFormType).sort()
    )
  })

  let model: FormModel
  let translator: ReturnType<FormModel['createTranslator']>

  beforeEach(() => {
    const updated = structuredClone(definition)
    updated.lists = [listString]

    model = new FormModel(updated, { basePath: 'test' })
    translator = model.createTranslator()
  })

  describe('Supported', () => {
    describe.each(SUPPORTED_COMPONENT_TYPES)('%s', (type) => {
      it('honours the override', () => {
        const collection = new ComponentCollection(
          [buildComponent(type, OVERRIDE)],
          { model }
        )
        const result = collection.validate(getInput(type))

        expect(result.errors).toEqual([
          expect.objectContaining({ text: CUSTOM })
        ])
      })

      it('honours the override at request time (with a translator)', () => {
        const collection = new ComponentCollection(
          [buildComponent(type, OVERRIDE)],
          { model }
        )
        const result = collection.validate(getInput(type), translator)

        expect(result.errors).toEqual([
          expect.objectContaining({ text: CUSTOM })
        ])
      })
    })
  })

  /**
   * Setting the option has no effect, so the same input must give the same
   * errors with and without it.
   */
  describe('Not supported', () => {
    it.each(NOT_SUPPORTED_COMPONENT_TYPES)('%s', (type) => {
      const input = getInput(type)
      const baseline = new ComponentCollection([buildComponent(type)], {
        model
      }).validate(input)
      const overridden = new ComponentCollection(
        [buildComponent(type, OVERRIDE)],
        { model }
      ).validate(input)

      expect(baseline.errors?.length).toBeGreaterThan(0)
      expect(overridden.errors).toEqual(baseline.errors)
    })
  })
})
