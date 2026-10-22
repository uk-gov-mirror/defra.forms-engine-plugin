import {
  ComponentType,
  isFormType,
  type ComponentDef
} from '@defra/forms-model'

import { ComponentCollection } from '~/src/server/plugins/engine/components/ComponentCollection.js'
import { FormModel } from '~/src/server/plugins/engine/models/FormModel.js'
import definition from '~/test/form/definitions/blank.js'
import { getFormData } from '~/test/helpers/component-helpers.js'

/**
 * Each component has its own test file for schema, state and view model
 * checks. This file has one job: check the singular `options.customValidationMessage`
 * string (it applies to every key in a component's schema) for every
 * component type, in two ways:
 * - `validate(input)` - a plain unit test, no translator.
 * - `validate(input, translator)` - matches a real request. `FormModel.ts`
 *   always passes a translator when it validates form input.
 *
 * Support for the plural `options.customValidationMessages` map is not the
 * same as support for this singular option, so that option has its own test
 * file: customValidationMessages.test.ts.
 *
 * The lists below record which components declare and read this option.
 * They come from reading each component's source code and its
 * `@defra/forms-model` type, not from guessing. Only 11 of the 23
 * form ComponentType values declare customValidationMessage on their options
 * type at all - the other 12 cannot express it, so TypeScript itself proves
 * the option does not apply to them. No runtime test is needed for those;
 * they are listed below only so the coverage guard test accounts for every
 * form ComponentType.
 *
 * Fixed regression: NumberField, OsGridRefField and NationalGridFieldNumberField
 * worked in v4.23.0 (the last v4 release, which had no
 * `getValidationMessagesOverride()` and no translator argument on
 * `validate()`). In v5, `getValidationMessagesOverride()` always replaced the
 * author's message with a translated default at request time, breaking the
 * option. `withCustomValidationOverrides()` (components/helpers/index.ts) now
 * builds the override from the author's message when one is set.
 *
 * Not a regression: YesNoField never supported the option in v4.23.0.
 */

const CUSTOM = 'This is a custom validation message'
const OVERRIDE = { customValidationMessage: CUSTOM }

/**
 * Component types that declare customValidationMessage on their options
 * type and read it. Tested below under 'Supported'.
 */
const SUPPORTS_SINGULAR_MESSAGE = [
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
 * Component types that declare customValidationMessage on their options
 * type but never read it. Tested below under 'Not supported'.
 */
const NOT_SUPPORTED_COMPONENT_TYPES = [
  ComponentType.EastingNorthingField,
  ComponentType.LatLongField,
  ComponentType.MonthYearField
]

/**
 * Component types with no customValidationMessage field on their options
 * type. TypeScript itself proves the option cannot be set, so there is
 * nothing to test at runtime. Listed here only so the coverage guard test
 * below accounts for every form ComponentType.
 */
const NO_SINGULAR_MESSAGE_OPTION = [
  ComponentType.CheckboxesField,
  ComponentType.DatePartsField,
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
const DEFINITION_FIELDS: Partial<Record<ComponentType, { schema: object }>> = {
  [ComponentType.MultilineTextField]: { schema: {} },
  [ComponentType.NumberField]: { schema: {} }
}

/**
 * Build a component definition for a type, with extra options merged in
 */
function buildComponent(type: ComponentType, options = {}) {
  return {
    title: 'Example field',
    name: 'myComponent',
    type,
    ...DEFINITION_FIELDS[type],
    options
  } as ComponentDef
}

describe('Component-level validation message override (customValidationMessage)', () => {
  // Fails when a new form ComponentType is not in one of the three lists above.
  it('accounts for every form ComponentType', () => {
    const accountedFor = [
      ...SUPPORTS_SINGULAR_MESSAGE,
      ...NOT_SUPPORTED_COMPONENT_TYPES,
      ...NO_SINGULAR_MESSAGE_OPTION
    ]

    expect(new Set(accountedFor).size).toBe(accountedFor.length)
    expect([...accountedFor].sort()).toEqual(
      Object.values(ComponentType).filter(isFormType).sort()
    )
  })

  let model: FormModel
  let translator: ReturnType<FormModel['createTranslator']>

  beforeEach(() => {
    model = new FormModel(definition, { basePath: 'test' })
    translator = model.createTranslator()
  })

  describe('Supported', () => {
    describe.each(SUPPORTS_SINGULAR_MESSAGE)('%s', (type) => {
      it('honours the override', () => {
        const collection = new ComponentCollection(
          [buildComponent(type, OVERRIDE)],
          { model }
        )
        const result = collection.validate(getFormData())

        expect(result.errors).toEqual([
          expect.objectContaining({ text: CUSTOM })
        ])
      })

      it('honours the override at request time (with a translator)', () => {
        const collection = new ComponentCollection(
          [buildComponent(type, OVERRIDE)],
          { model }
        )
        const result = collection.validate(getFormData(), translator)

        expect(result.errors).toEqual([
          expect.objectContaining({ text: CUSTOM })
        ])
      })
    })
  })

  /**
   * These components declare customValidationMessage on their options type
   * but ignore it. Setting the option has no effect, so the same input must
   * give the same errors with and without it.
   */
  describe('Not supported', () => {
    it.each(NOT_SUPPORTED_COMPONENT_TYPES)('%s', (type) => {
      const input = getFormData()
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
