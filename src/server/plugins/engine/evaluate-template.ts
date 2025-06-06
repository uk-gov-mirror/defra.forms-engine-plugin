import { type ComponentDef, type Page } from '@defra/forms-model'
import { Liquid } from 'liquidjs'

import { type Field } from '~/src/server/plugins/engine/components/helpers-pure.js'
import { getAnswer } from '~/src/server/plugins/engine/components/helpers.js'
import { getPageHref } from '~/src/server/plugins/engine/helpers.js'
import { type FormContext } from '~/src/server/plugins/engine/types.js'
import { type FormQuery } from '~/src/server/routes/types.js'

export const engine = new Liquid({
  outputEscape: 'escape',
  jsTruthy: true,
  ownPropertyOnly: false
})

export interface GlobalScope {
  context: FormContext
  pages: Map<string, Page>
  components: Map<string, ComponentDef>
}

engine.registerFilter('evaluate', function (template?: string) {
  if (typeof template !== 'string') {
    return template
  }

  const globals = this.context.globals as GlobalScope
  const evaluated = evaluateTemplate(template, globals.context)

  return evaluated
})

engine.registerFilter('page', function (path?: string) {
  if (typeof path !== 'string') {
    return
  }

  const globals = this.context.globals as GlobalScope
  const pageDef = globals.pages.get(path)

  return pageDef
})

engine.registerFilter('href', function (path: string, query?: FormQuery) {
  if (typeof path !== 'string') {
    return
  }

  const globals = this.context.globals as GlobalScope
  const page = globals.context.pageMap.get(path)

  if (page === undefined) {
    return
  }

  return getPageHref(page, query)
})

engine.registerFilter('field', function (name: string) {
  if (typeof name !== 'string') {
    return
  }

  const globals = this.context.globals as GlobalScope
  const componentDef = globals.components.get(name)

  return componentDef
})

engine.registerFilter('answer', function (name: string) {
  if (typeof name !== 'string') {
    return
  }

  const globals = this.context.globals as GlobalScope
  const component = globals.context.componentMap.get(name)

  if (!component?.isFormComponent) {
    return
  }

  const answer = getAnswer(component as Field, globals.context.relevantState)

  return answer
})

export function evaluateTemplate(
  template: string,
  context: FormContext
): string {
  const globals: GlobalScope = {
    context,
    pages: context.pageDefMap,
    components: context.componentDefMap
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return engine.parseAndRenderSync(template, context.relevantState, {
    globals
  })
}
