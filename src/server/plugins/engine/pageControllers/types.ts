import type * as PageControllers from '~/src/server/plugins/engine/pageControllers/index.js'

export type PageControllerClass = InstanceType<PageControllerType>
export type PageControllerType =
  (typeof PageControllers)[keyof typeof PageControllers]
