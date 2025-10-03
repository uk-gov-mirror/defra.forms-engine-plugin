import { type Plugin, type Server } from '@hapi/hapi'

import { type PluginOptions } from '~/src/server/plugins/forms/types.js'

export const plugin = {
  name: '@defra/forms-manifest',
  multiple: false,
  register(server: Server, options: PluginOptions) {
    server.route({
      method: 'GET',
      path: '/forms-manifest',
      handler: (_, h) => {
        const prefix = options.serverRegistrationOptions?.routes?.prefix ?? ''

        return h.response({
          engineBaseUrl: prefix
        })
      }
    })
  }
} satisfies Plugin<PluginOptions>
