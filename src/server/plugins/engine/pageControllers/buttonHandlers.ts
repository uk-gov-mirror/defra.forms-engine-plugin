import Boom from '@hapi/boom'

import {
  getCacheService,
  getSaveAndExitHelpers
} from '~/src/server/plugins/engine/helpers.js'
import { type FormContext } from '~/src/server/plugins/engine/types.js'
import { type FormRequestPayload } from '~/src/server/routes/types.js'

/**
 * Handle save-and-exit action by processing form data and return exit path
 */
export async function handleSaveAndExit(
  request: FormRequestPayload,
  context: FormContext
): Promise<string> {
  const { state } = context

  // Save the current state and return the exit path
  const saveAndExit = getSaveAndExitHelpers(request.server)

  if (!saveAndExit?.sessionPersister) {
    throw Boom.internal('Server misconfigured for save and exit')
  }

  await saveAndExit.sessionPersister(state, request)

  const cacheService = getCacheService(request.server)
  await cacheService.clearState(request)

  return '/exit'
}
