import { type Plugin, type Server } from '@hapi/hapi'

import enginePlugin from '~/src/server/plugins/engine/index.js'
import { type PluginOptions } from '~/src/server/plugins/forms/types.js'
import { plugin as manifestPlugin } from '~/src/server/plugins/manifest/index.js'

export const plugin = {
  name: '@defra/forms-index',
  dependencies: ['@hapi/crumb', '@hapi/yar', 'hapi-pino'],
  multiple: true,
  async register(server: Server, options?: PluginOptions) {
    // routes that should have a predictable URL
    await server.register({
      plugin: manifestPlugin,
      options
    })

    // forms can be prefixed to prevent collisions
    await server.register(
      {
        plugin: enginePlugin,
        options: options?.engine
      },
      options?.serverRegistrationOptions
    )
  }
} satisfies Plugin<PluginOptions>
