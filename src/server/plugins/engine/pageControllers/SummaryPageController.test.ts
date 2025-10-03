import { FormModel } from '~/src/server/plugins/engine/models/FormModel.js'
import { SummaryPageController } from '~/src/server/plugins/engine/pageControllers/SummaryPageController.js'
import { type FormSubmissionState } from '~/src/server/plugins/engine/types.js'
import {
  type FormRequestPayload,
  type FormResponseToolkit
} from '~/src/server/routes/types.js'
import { type CacheService } from '~/src/server/services/cacheService.js'
import definition from '~/test/form/definitions/basic.js'

describe('SummaryPageController', () => {
  let model: FormModel
  let controller: SummaryPageController

  beforeEach(() => {
    model = new FormModel(definition, {
      basePath: 'test'
    })

    // Create a mock page for SummaryPageController
    const mockPage = {
      ...definition.pages[0],
      controller: 'summary'
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    controller = new SummaryPageController(model, mockPage as any)
  })

  describe('handle errors', () => {
    it('should display errors including summary', () => {
      const requestPage1 = {
        abc: '123'
      }
      const h = {} as unknown as FormResponseToolkit
      const saveAndExitMock = jest.fn(() => ({}))
      const state: FormSubmissionState = {
        $$__referenceNumber: 'foobar',
        yesNoField: true
      }
      const request = {
        ...requestPage1,
        server: {
          plugins: {
            'forms-engine-plugin': {
              saveAndExit: saveAndExitMock,
              cacheService: {
                clearState: jest.fn()
              } as unknown as CacheService
            }
          }
        },
        method: 'post',
        payload: { yesNoField: true, action: 'save-and-exit' }
      } as unknown as FormRequestPayload

      const context = model.getFormContext(request, state)

      controller.handleSaveAndExit(request, context, h)

      expect(saveAndExitMock).toHaveBeenCalledWith(request, h, context)
    })
  })
})
