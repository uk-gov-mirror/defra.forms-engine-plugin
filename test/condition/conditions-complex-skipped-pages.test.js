import { resolve } from 'node:path'

import { within } from '@testing-library/dom'
import { StatusCodes } from 'http-status-codes'

import { FORM_PREFIX } from '~/src/server/constants.js'
import { createServer } from '~/src/server/index.js'
import { getFormMetadata } from '~/src/server/plugins/engine/services/formsService.js'
import * as fixtures from '~/test/fixtures/index.js'
import { renderResponse } from '~/test/helpers/component-helpers.js'
import { getCookie, getCookieHeader } from '~/test/utils/get-cookie.js'

const basePath = `${FORM_PREFIX}/conditions-complex-flow`

jest.mock('~/src/server/utils/notify.ts')
jest.mock('~/src/server/plugins/engine/services/formsService.js')
jest.mock('~/src/server/plugins/engine/services/formSubmissionService.js')

describe('Form journey', () => {
  const journey = [
    /**
     * Question page 1
     */
    {
      heading1:
        'Installations and medium combustion plant and specified generator permits: ask for pre-application advice',

      paths: {
        current:
          '/installations-and-medium-combustion-plant-and-specified-generator-permits-ask-for-pre-application-advice',
        next: '/what-is-the-main-activity-you-want-advice-for'
      },

      fields: [
        {
          title: 'Will or does your activity take place in England?',
          payload: {
            empty: { NKpEWI: '' },
            valid: { NKpEWI: 'true' }
          },

          errors: {
            empty: 'Select activity in England?'
          }
        }
      ]
    },

    /**
     * Question page 2
     */
    {
      heading1: 'What is the main activity you want advice for?',

      paths: {
        previous:
          '/installations-and-medium-combustion-plant-and-specified-generator-permits-ask-for-pre-application-advice',
        current: '/what-is-the-main-activity-you-want-advice-for',
        next: '/is-your-pre-application-request-related-to-a-priority-tracked-application'
      },

      fields: [
        {
          title: 'What is the main activity you want advice for?',
          payload: {
            empty: { DXJWgF: '' },
            valid: {
              DXJWgF:
                'Using, treating, storing or disposing of waste or mining waste, an industrial process, intensive farms, manufacturing or any other business that produce potentially harmful substances.'
            }
          },

          errors: {
            empty: 'Select main activity'
          }
        }
      ]
    },

    /**
     * Question page 3
     */
    {
      heading1:
        'Is your pre-application request related to a priority tracked application?',

      paths: {
        previous: '/what-is-the-main-activity-you-want-advice-for',
        current:
          '/is-your-pre-application-request-related-to-a-priority-tracked-application',
        next: '/do-you-want-to-know-more-about-permit-applications-for-the-following-types-of-activities-known-as-a1-installations-or-are-you-carrying-out-a-medium-combustion-or-specified-generator-activity'
      },

      fields: [
        {
          title:
            'Is your pre-application request related to a priority tracked application?',
          payload: {
            empty: { dxNvxj: '' },
            valid: { dxNvxj: 'false' }
          },

          errors: {
            empty: 'Select tracked?'
          }
        }
      ]
    },

    /**
     * Question page 4
     */
    {
      heading1:
        "Do you want to know more about permit applications for the following types of activities, known as 'A1 installations' or are you carrying out a medium combustion or specified generator activity?",

      paths: {
        previous:
          '/is-your-pre-application-request-related-to-a-priority-tracked-application',
        current:
          '/do-you-want-to-know-more-about-permit-applications-for-the-following-types-of-activities-known-as-a1-installations-or-are-you-carrying-out-a-medium-combustion-or-specified-generator-activity',
        next: '/what-is-or-will-be-your-main-chemicals-a1-installations-activity-that-you-need-pre-application-advice-about'
      },

      fields: [
        {
          title:
            "Do you want to know more about permit applications for the following types of activities, known as 'A1 installations' or are you carrying out a medium combustion or specified generator activity?",
          payload: {
            empty: { mOPwGp: '' },
            valid: {
              mOPwGp:
                'Chemicals: organic, inorganic, fertiliser production, plant health products and biocides, pharmaceutical production, explosives production, manufacturing involving ammonia'
            }
          },

          errors: {
            empty: 'Select installation type'
          }
        }
      ]
    },

    /**
     * Question page 5
     */
    {
      heading1:
        'What is or will be your main chemicals A1 installations activity that you need pre-application advice about?',

      paths: {
        previous:
          '/do-you-want-to-know-more-about-permit-applications-for-the-following-types-of-activities-known-as-a1-installations-or-are-you-carrying-out-a-medium-combustion-or-specified-generator-activity',
        current:
          '/what-is-or-will-be-your-main-chemicals-a1-installations-activity-that-you-need-pre-application-advice-about',
        next: '/does-your-proposal-include-the-production-of-hydrogen'
      },

      fields: [
        {
          title:
            'What is or will be your main chemicals A1 installations activity that you need pre-application advice about?',
          payload: {
            empty: { zmhOBi: '' },
            valid: { zmhOBi: 'Inorganic chemicals' }
          },

          errors: {
            empty: 'Select chemical activity type'
          }
        }
      ]
    },

    /**
     * Question page 6
     */
    {
      heading1: 'Does your proposal include the production of hydrogen?',

      paths: {
        previous:
          '/what-is-or-will-be-your-main-chemicals-a1-installations-activity-that-you-need-pre-application-advice-about',
        current: '/does-your-proposal-include-the-production-of-hydrogen',
        next: '/hydrogen-production-by-electrolysis-of-water'
      },

      fields: [
        {
          title: 'Does your proposal include the production of hydrogen?',
          payload: {
            empty: { COmJlN: '' },
            valid: { COmJlN: 'true' }
          },

          errors: {
            empty: 'Select hydrogen production'
          }
        }
      ]
    },

    /**
     * Question page 7
     */
    {
      heading1: 'Hydrogen production by electrolysis of water',

      paths: {
        previous: '/does-your-proposal-include-the-production-of-hydrogen',
        current: '/hydrogen-production-by-electrolysis-of-water',
        next: '/co2-capture'
      },

      fields: [
        {
          title: 'Do you propose to produce hydrogen by electrolysis of water?',
          payload: {
            empty: { iejpzo: '' },
            valid: { iejpzo: 'false' }
          },

          errors: {
            empty: 'Select electrolysis'
          }
        }
      ]
    },

    /**
     * Question page 8
     */
    {
      heading1: 'CO2 Capture',

      paths: {
        previous: '/hydrogen-production-by-electrolysis-of-water',
        current: '/co2-capture',
        next: '/does-the-method-of-carbon-dioxide-co2-capture-use-amines'
      },

      fields: [
        {
          title: 'Do you intend to capture the CO2 from your process?',
          payload: {
            empty: { ROjlJT: '' },
            valid: { ROjlJT: 'true' }
          },

          errors: {
            empty: 'Select cO2 Capture'
          }
        }
      ]
    },

    /**
     * Question page 9
     */
    {
      heading1: 'Does the method of carbon dioxide (CO2) capture use amines?',

      paths: {
        previous: '/co2-capture',
        current: '/does-the-method-of-carbon-dioxide-co2-capture-use-amines',
        next: '/what-type-of-permit-application-do-you-want-pre-application-advice-about'
      },

      fields: [
        {
          title: 'Does the method of carbon dioxide (CO2) capture use amines?',
          payload: {
            empty: { zKdAit: '' },
            valid: { zKdAit: 'false' }
          },

          errors: {
            empty: 'Select amine capture'
          }
        }
      ]
    }
  ]

  /** @type {Server} */
  let server

  /** @type {string} */
  let csrfToken

  /** @type {ReturnType<typeof getCookieHeader>} */
  let headers

  /** @type {BoundFunctions<typeof queries>} */
  let container

  // Create server before each test
  beforeAll(async () => {
    server = await createServer({
      formFileName: 'conditions-complex-flow.json',
      formFilePath: resolve(import.meta.dirname, '../form/definitions')
    })

    await server.initialize()

    // Navigate to start
    const response = await server.inject({
      url: `${basePath}${journey[0].paths.current}`
    })

    // Extract the session cookie
    csrfToken = getCookie(response, 'crumb')
    headers = getCookieHeader(response, ['session', 'crumb'])
  })

  beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(getFormMetadata).mockResolvedValue(fixtures.form.metadata)
  })

  afterAll(async () => {
    await server.stop()
  })

  describe.each(journey)(
    'Page: $paths.current',
    ({ heading1, paths, fields = [] }) => {
      beforeEach(async () => {
        ;({ container } = await renderResponse(server, {
          url: `${basePath}${paths.current}`,
          headers
        }))
      })

      if (paths.previous) {
        it('should render the back link', () => {
          const $backLink = container.getByRole('link', {
            name: 'Back'
          })

          expect($backLink).toBeInTheDocument()
          expect($backLink).toHaveAttribute(
            'href',
            `${basePath}${paths.previous}`
          )
        })
      }

      it('should render the page heading', () => {
        const $heading = container.getByRole('heading', {
          name: heading1,
          level: 1
        })

        expect($heading).toBeInTheDocument()
      })

      if (paths.next) {
        it('should show errors when invalid on submit', async () => {
          const payload = {}

          for (const field of fields) {
            Object.assign(payload, field.payload.empty)
          }

          // Submit form with empty values
          const { container, response } = await renderResponse(server, {
            url: `${basePath}${paths.current}`,
            method: 'POST',
            headers,
            payload: { ...payload, crumb: csrfToken }
          })

          expect(response.statusCode).toBe(StatusCodes.OK)
          expect(response.headers.location).toBeUndefined()

          const $errorSummary = container.getByRole('alert')
          const $errorItems = within($errorSummary).getAllByRole('listitem')

          const $heading = within($errorSummary).getByRole('heading', {
            name: 'There is a problem',
            level: 2
          })

          expect($heading).toBeInTheDocument()

          for (const [index, { errors }] of fields.entries()) {
            expect($errorItems[index]).toHaveTextContent(errors.empty)
          }
        })

        it('should redirect to the next page on submit', async () => {
          const payload = {}

          for (const field of fields) {
            Object.assign(payload, field.payload.valid)
          }

          // Submit form with populated values
          const response = await server.inject({
            url: `${basePath}${paths.current}`,
            method: 'POST',
            headers,
            payload: { ...payload, crumb: csrfToken }
          })

          expect(response.statusCode).toBe(StatusCodes.SEE_OTHER)
          expect(response.headers.location).toBe(`${basePath}${paths.next}`)
        })
      }
    }
  )
})

/**
 * @import { Server } from '@hapi/hapi'
 * @import { BoundFunctions, queries } from '@testing-library/dom'
 */
