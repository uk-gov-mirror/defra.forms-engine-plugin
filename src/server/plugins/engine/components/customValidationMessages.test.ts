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
 * Each component has its own test file for schema, state and view model
 * checks. This file has one job: check `options.customValidationMessages`
 * (a map keyed by Joi error type) for every component type, in two ways:
 * - `validate(input)` - a plain unit test, no translator.
 * - `validate(input, translator)` - matches a real request. `FormModel.ts`
 *   always passes a translator when it validates form input.
 *
 * The lists below record which components use the option. They come from
 * reading each component's source code, not from guessing.
 *
 * Some of these components also support a singular `customValidationMessage`
 * string. Support for the two options is not identical, so the singular
 * option has its own test file: customValidationMessage.test.ts.
 *
 * Fixed regression: NumberField, OsGridRefField, NationalGridFieldNumberField
 * and AutocompleteField worked in v4.23.0 (the last v4 release, which had no
 * `getValidationMessagesOverride()` and no translator argument on
 * `validate()`). In v5, `getValidationMessagesOverride()` always replaced the
 * author's message with a translated default at request time, breaking the
 * option. `withCustomValidationOverrides()` (components/helpers/index.ts) now
 * keeps the author's message for any key they set.
 *
 * Not a regression: YesNoField never supported the option in v4.23.0.
 */

const CUSTOM = 'This is a custom validation message'
const OVERRIDE = { customValidationMessages: { 'any.required': CUSTOM } }

/**
 * Component types that read options.customValidationMessages and use it
 * in their Joi schema. Tested below under 'Supported'.
 */
const SUPPORTED_COMPONENT_TYPES = [
  ComponentType.TextField,
  ComponentType.EmailAddressField,
  ComponentType.MultilineTextField,
  ComponentType.TelephoneNumberField,
  ComponentType.NumberField,
  ComponentType.OsGridRefField,
  ComponentType.NationalGridFieldNumberField,
  ComponentType.YesNoField,
  ComponentType.RadiosField,
  ComponentType.SelectField,
  ComponentType.AutocompleteField
]

/**
 * Component types that never read options.customValidationMessages.
 * CheckboxesField reads it but then throws away that schema. Tested below
 * under 'Not supported'.
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
  ComponentType.TrackingField
]

interface Fixture {
  def?: { list?: string; content?: string; options?: object; schema?: object }
  input?: FormPayload
}

/**
 * Definition fields and form input for each type, where they differ from
 * the defaults in `buildComponent()` and `getInput()`. Each input gives a
 * validation error.
 */
const FIXTURES: Partial<Record<ComponentType, Fixture>> = {
  [ComponentType.MultilineTextField]: { def: { schema: {} } },
  [ComponentType.NumberField]: { def: { schema: {} } },
  [ComponentType.FileUploadField]: { def: { schema: {} } },
  [ComponentType.RadiosField]: { def: { list: 'listString' } },
  [ComponentType.SelectField]: { def: { list: 'listString' } },
  [ComponentType.AutocompleteField]: { def: { list: 'listString' } },
  [ComponentType.CheckboxesField]: { def: { list: 'listString' } },
  [ComponentType.DeclarationField]: {
    def: { content: 'Lorem ipsum dolar sit amet' },
    input: getFormData(['unchecked'])
  },
  [ComponentType.PaymentField]: {
    def: {
      options: { amount: 100, description: 'Test payment description' }
    },
    input: getFormData({
      paymentId: '',
      reference: '',
      amount: 0,
      description: '',
      uuid: '',
      formId: '',
      isLivePayment: false
    } as unknown as FormValue)
  }
}

/**
 * Build a component definition for a type, with extra options merged in
 */
function buildComponent(type: ComponentType, options = {}) {
  const def = FIXTURES[type]?.def

  return {
    title: 'Example field',
    name: 'myComponent',
    type,
    ...def,
    options: { ...def?.options, ...options }
  } as ComponentDef
}

/**
 * Get empty form input for a type
 */
function getInput(type: ComponentType) {
  return FIXTURES[type]?.input ?? getFormData()
}

describe('Component-level validation message override (customValidationMessages)', () => {
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
   * These components ignore options.customValidationMessages. Setting the
   * option has no effect, so the same input must give the same errors with
   * and without it.
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
