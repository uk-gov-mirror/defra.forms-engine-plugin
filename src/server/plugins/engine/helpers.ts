import {
  ControllerPath,
  Engine,
  hasComponents,
  isFormType,
  type FormDefinition
} from '@defra/forms-model'
import Boom from '@hapi/boom'
import { type ResponseToolkit, type Server } from '@hapi/hapi'
import { format, parseISO } from 'date-fns'
import { StatusCodes } from 'http-status-codes'
import { type ValidationErrorItem } from 'joi'

import { createLogger } from '~/src/server/common/helpers/logging/logger.js'
import { type FormModel } from '~/src/server/plugins/engine/models/index.js'
import { type PageControllerClass } from '~/src/server/plugins/engine/pageControllers/types.js'
import {
  type FormContextRequest,
  type FormSubmissionError
} from '~/src/server/plugins/engine/types.js'
import {
  FormAction,
  FormStatus,
  type FormParams,
  type FormQuery,
  type FormRequest,
  type FormRequestPayload
} from '~/src/server/routes/types.js'

export const logger = createLogger()

/**
 * Encodes a URL, returning undefined if the process fails.
 */
export function encodeUrl(link?: string) {
  if (link) {
    try {
      return new URL(link).toString() // escape the search params without breaking the ? and & reserved characters in rfc2368
    } catch (err) {
      logger.error(err, `Failed to encode ${link}`)
      throw err
    }
  }
}

/**
 * Get redirect path with optional query params
 */
export function redirectPath(nextUrl: string, query: FormQuery = {}) {
  const isRelative = isPathRelative(nextUrl)

  // Filter string query params only
  const params = Object.entries(query).filter(
    (query): query is [string, string] => typeof query[1] === 'string'
  )

  // Build URL with relative path support
  const url = isRelative
    ? new URL(nextUrl, 'http://example.com')
    : new URL(nextUrl)

  // Append query params
  for (const [name, value] of params) {
    url.searchParams.set(name, value)
  }

  if (isRelative) {
    return `${url.pathname}${url.search}`
  }

  return url.href
}

export function isPathRelative(path?: string) {
  return (path ?? '').startsWith('/')
}

export function normalisePath(path = '') {
  return path
    .trim() // Trim empty spaces
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/$/, '') // Remove trailing slash
}

/**
 * Get page href
 */
export function getPageHref(
  page: PageControllerClass,
  query?: FormQuery
): string
/**
 * Get page href by path
 */
export function getPageHref(
  page: PageControllerClass,
  path: string,
  query?: FormQuery
): string
export function getPageHref(
  page: PageControllerClass,
  pathOrQuery?: string | FormQuery,
  queryOnly: FormQuery = {}
) {
  const path = typeof pathOrQuery === 'string' ? pathOrQuery : page.path
  const query = typeof pathOrQuery === 'object' ? pathOrQuery : queryOnly

  if (!isPathRelative(path)) {
    throw Error(`Only relative URLs are allowed: ${path}`)
  }

  // Return path with page href as base
  return redirectPath(page.getHref(path), query)
}

export function getPage(
  model: FormModel | undefined,
  request: FormContextRequest
) {
  const { params } = request

  const page = findPage(model, `/${params.path}`)

  if (!page) {
    throw Boom.notFound(`No page found for /${params.path}`)
  }

  return page
}

export function findPage(model: FormModel | undefined, path?: string) {
  const findPath = `/${normalisePath(path)}`
  return model?.pages.find(({ path }) => path === findPath)
}

export function proceed(
  request: Pick<FormContextRequest, 'method' | 'payload' | 'query'>,
  h: Pick<ResponseToolkit, 'redirect' | 'view'>,
  nextUrl: string
) {
  const { method, payload, query } = request
  const { returnUrl } = query

  const isReturnAllowed =
    payload && 'action' in payload
      ? payload.action === FormAction.Continue ||
        payload.action === FormAction.Validate
      : false

  // Redirect to return location (optional)
  const response =
    isReturnAllowed && isPathRelative(returnUrl)
      ? h.redirect(returnUrl)
      : h.redirect(redirectPath(nextUrl))

  // Redirect POST to GET to avoid resubmission
  return method === 'post'
    ? response.code(StatusCodes.SEE_OTHER)
    : response.code(StatusCodes.MOVED_TEMPORARILY)
}
export function getStartPath(model?: FormModel) {
  if (model?.engine === Engine.V2) {
    const startPath = normalisePath(model.def.pages.at(0)?.path)
    return startPath ? `/${startPath}` : ControllerPath.Start
  }

  const startPath = normalisePath(model?.def.startPage)
  return startPath ? `/${startPath}` : ControllerPath.Start
}

export function checkFormStatus(params?: FormParams) {
  const isPreview = !!params?.state

  let state = FormStatus.Live

  if (isPreview && params.state === FormStatus.Draft) {
    state = FormStatus.Draft
  }

  return {
    isPreview,
    state
  }
}

export function checkEmailAddressForLiveFormSubmission(
  emailAddress: string | undefined,
  isPreview: boolean
) {
  if (!emailAddress && !isPreview) {
    throw Boom.internal(
      'An email address is required to complete the form submission'
    )
  }
}

/**
 * Parses the errors from {@link Schema.validate} so they can be rendered by govuk-frontend templates
 * @param [details] - provided by {@link Schema.validate}
 */
export function getErrors(
  details?: ValidationErrorItem[]
): FormSubmissionError[] | undefined {
  if (!details?.length) {
    return
  }

  return details.map(getError)
}

export function getError(detail: ValidationErrorItem): FormSubmissionError {
  const { context, message, path } = detail

  const name = context?.key ?? ''
  const href = `#${name}`

  const text = message.replace(
    /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/,
    (text) => format(parseISO(text), 'd MMMM yyyy')
  )

  return {
    path,
    href,
    name,
    text,
    context
  }
}

/**
 * A small helper to safely generate a crumb token.
 * Checks that the crumb plugin is available, that crumb
 * is not disabled on the current route, and that cookies/state are present.
 */
export function safeGenerateCrumb(
  request: FormRequest | FormRequestPayload | null
): string | undefined {
  // no request or no .state
  if (!request?.state) {
    return undefined
  }

  // crumb plugin or its generate method doesn't exist
  if (!request.server.plugins.crumb.generate) {
    return undefined
  }

  // crumb is explicitly disabled for this route
  if (request.route.settings.plugins?.crumb === false) {
    return undefined
  }

  return request.server.plugins.crumb.generate(request)
}

/**
 * Calculates an exponential backoff delay (in milliseconds) based on the current retry depth,
 * using a base delay of 2000ms (2 seconds) and doubling for each additional depth, while capping the delay at 25,000ms (25 seconds).
 * @param depth - The current retry depth (1, 2, 3, …)
 * @returns The calculated delay in milliseconds.
 */
export function getExponentialBackoffDelay(depth: number): number {
  const BASE_DELAY_MS = 2000 // 2 seconds initial delay
  const CAP_DELAY_MS = 25000 // cap each delay to 25 seconds
  const delay = BASE_DELAY_MS * 2 ** (depth - 1)
  return Math.min(delay, CAP_DELAY_MS)
}

export function getCacheService(server: Server) {
  return server.plugins['forms-engine-plugin'].cacheService
}

/**
 * Handles logging and issuing a permanent redirect for legacy routes.
 * @param h - The Hapi response toolkit.
 * @param targetUrl - The URL to redirect to.
 * @returns The Hapi response object configured for permanent redirect.
 */
export function handleLegacyRedirect(h: ResponseToolkit, targetUrl: string) {
  return h.redirect(targetUrl).permanent().takeover()
}

/**
 * If the page doesn't have a title, set it from the title of the first form component
 * @param def - the form definition
 */
export function setPageTitles(def: FormDefinition) {
  def.pages.forEach((page) => {
    if (!page.title) {
      if (hasComponents(page)) {
        // Set the page title from the first form component
        const firstFormComponent = page.components.find((component) =>
          isFormType(component.type)
        )

        page.title = firstFormComponent?.title ?? ''
      }

      if (!page.title) {
        const formNameMsg = def.name ? ` in form '${def.name}'` : ''

        logger.warn(`Page '${page.path}' has no title${formNameMsg}`)
      }
    }
  })
}
