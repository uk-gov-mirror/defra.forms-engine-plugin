import Joi from 'joi'

import { type FormPayloadParams } from '~/src/server/plugins/engine/types.js'
import { FormAction, FormStatus } from '~/src/server/routes/types.js'

export const stateSchema = Joi.string<FormStatus>()
  .valid(FormStatus.Draft, FormStatus.Live)
  .required()

// export const actionSchema = Joi.string<FormAction>()
//   .valid(...Object.values(FormAction), Joi.string().regex(/^postcode-lookup-/))
//   .default(FormAction.Validate)
//   .optional()

export const actionSchema = Joi.string<FormAction>()
  .pattern(new RegExp(`^${FormAction.PostcodeLookup}-[a-zA-Z]{6}$`))
  .allow(
    ...Object.values(FormAction).filter(
      (value) => value !== FormAction.PostcodeLookup
    )
  )
  .default(FormAction.Validate)
  .optional()

export const pathSchema = Joi.string().required()
export const itemIdSchema = Joi.string().uuid().required()
export const crumbSchema = Joi.string().optional().allow('')
export const confirmSchema = Joi.boolean().empty(false)

export const paramsSchema = Joi.object<FormPayloadParams>()
  .keys({
    action: actionSchema,
    confirm: confirmSchema,
    crumb: crumbSchema,
    itemId: itemIdSchema.optional()
  })
  .default({})
  .optional()
