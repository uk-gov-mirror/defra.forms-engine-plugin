import {
  ComponentType,
  hasComponentsEvenIfNoNext,
  type ComponentDef,
  type Page
} from '@defra/forms-model'
import findLastIndex from 'lodash/findLastIndex.js'

import { ComponentCollection } from '~/src/server/plugins/engine/components/ComponentCollection.js'
import { type FormModel } from '~/src/server/plugins/engine/models/index.js'
import { SummaryPageController } from '~/src/server/plugins/engine/pageControllers/SummaryPageController.js'
import { actionSchema, crumbSchema } from '~/src/server/schemas/index.js'

export class SummaryPageWithConfirmationEmailController extends SummaryPageController {
  constructor(model: FormModel, pageDef: Page) {
    super(model, pageDef)

    this.addConfirmationEmailAddress(pageDef)

    // Components collection
    this.collection = new ComponentCollection(
      hasComponentsEvenIfNoNext(pageDef) ? pageDef.components : [],
      { model, page: this }
    )

    this.collection.formSchema = this.collection.formSchema.keys({
      crumb: crumbSchema,
      action: actionSchema
    })
  }

  addConfirmationEmailAddress(pageDef: Page) {
    const confirmationEmailAddress = {
      title: 'Confirmation email',
      shortDescription: 'Email address',
      id: 'confirmationEmailAddress',
      name: 'confirmationEmailAddress',
      type: ComponentType.EmailAddressField,
      hint: 'Enter your email address to get an email confirming your form has been submitted',
      classes: 'my-label-override-class',
      options: {
        required: false
      }
    } as ComponentDef

    if (hasComponentsEvenIfNoNext(pageDef)) {
      const declarationPos = findLastIndex(
        pageDef.components,
        (comp) => comp.type === ComponentType.Markdown
      )
      if (declarationPos > -1) {
        pageDef.components.splice(declarationPos, 0, confirmationEmailAddress)
      } else {
        pageDef.components.push(confirmationEmailAddress)
      }
    }
  }
}
