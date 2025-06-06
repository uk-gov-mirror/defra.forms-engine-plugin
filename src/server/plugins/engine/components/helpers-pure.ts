import { ComponentType, type ComponentDef } from '@defra/forms-model'
import { Marked, type Token } from 'marked'

import { type ListFormComponent } from '~/src/server/plugins/engine/components/ListFormComponent.js'
import type * as Components from '~/src/server/plugins/engine/components/index.js'

export const addClassOptionIfNone = (
  options: Extract<ComponentDef, { options: { classes?: string } }>['options'],
  className: string
) => {
  if (!options.classes) {
    options.classes = className
  }
}

/**
 * Prevent Markdown formatting
 * @see {@link https://pandoc.org/chunkedhtml-demo/8.11-backslash-escapes.html}
 */
export function escapeMarkdown(answer: string) {
  const punctuation = [
    '`',
    "'",
    '*',
    '_',
    '{',
    '}',
    '[',
    ']',
    '(',
    ')',
    '#',
    '+',
    '-',
    '.',
    '!'
  ]

  for (const character of punctuation) {
    answer = answer.toString().replaceAll(character, `\\${character}`)
  }

  return answer
} // List component instances only
// All component instances
export type Component = InstanceType<
  (typeof Components)[keyof typeof Components]
>
// Field component instances only
export type Field = InstanceType<
  | typeof Components.AutocompleteField
  | typeof Components.RadiosField
  | typeof Components.YesNoField
  | typeof Components.CheckboxesField
  | typeof Components.DatePartsField
  | typeof Components.EmailAddressField
  | typeof Components.MonthYearField
  | typeof Components.MultilineTextField
  | typeof Components.NumberField
  | typeof Components.SelectField
  | typeof Components.TelephoneNumberField
  | typeof Components.TextField
  | typeof Components.UkAddressField
  | typeof Components.FileUploadField
>
// Guidance component instances only
export type Guidance = InstanceType<
  | typeof Components.Details
  | typeof Components.Html
  | typeof Components.Markdown
  | typeof Components.InsetText
  | typeof Components.List
>
export type ListField = InstanceType<
  | typeof Components.AutocompleteField
  | typeof Components.CheckboxesField
  | typeof Components.RadiosField
  | typeof Components.SelectField
  | typeof Components.YesNoField
>

/**
 * Filter known components with lists
 */
export function hasListFormField(
  field?: Partial<Component>
): field is ListFormComponent {
  return !!field && isListFieldType(field.type)
}

export function isListFieldType(
  type?: ComponentType
): type is ListField['type'] {
  const allowedTypes = [
    ComponentType.AutocompleteField,
    ComponentType.CheckboxesField,
    ComponentType.RadiosField,
    ComponentType.SelectField,
    ComponentType.YesNoField
  ]

  return !!type && allowedTypes.includes(type)
}

export const markdown = new Marked({
  breaks: true,
  gfm: true,

  /**
   * Render paragraphs without `<p>` wrappers
   * for check answers summary list `<dd>`
   */
  extensions: [
    {
      name: 'paragraph',
      renderer({ tokens = [] }) {
        const text = this.parser.parseInline(tokens)
        return tokens.length > 1 ? `${text}<br>` : text
      }
    }
  ],

  /**
   * Restrict allowed Markdown tokens
   */
  walkTokens(token) {
    const tokens: Token['type'][] = [
      'br',
      'escape',
      'list',
      'list_item',
      'paragraph',
      'space',
      'text'
    ]

    if (!tokens.includes(token.type)) {
      token.type = 'text'
    }
  }
})
