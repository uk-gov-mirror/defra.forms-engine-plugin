import { type ComponentDef } from '@defra/forms-model'
import joi, {
  type CustomValidator,
  type ErrorReportCollection,
  type ObjectSchema
} from 'joi'

// // Leaf
import '~/src/server/routes/types.js'
import '~/src/server/utils/type-utils.js'
import '~/src/server/constants.js'
import '~/src/server/plugins/engine/pageControllers/validationOptions.js'
import '~/src/server/plugins/engine/types.js'
import '~/src/server/plugins/engine/services/formsService.js'
import '~/src/server/plugins/engine/components/constants.js'
import '~/src/server/plugins/engine/components/ComponentBase.js'
import '~/src/server/plugins/nunjucks/filters/field.js'
import '~/src/server/plugins/nunjucks/filters/highlight.js'
import '~/src/server/plugins/nunjucks/filters/page.js'

// // Bad leaves
// import { ecsFormat } from '@elastic/ecs-pino-format'
import '~/src/config/index.js'
// utils.inspect
import '~/src/server/plugins/nunjucks/filters/inspect.js'
// crypto
import '~/src/server/plugins/engine/referenceNumbers.js'
// 'fs/promises' 'node:path'
import '~/src/server/utils/file-form-service.js'
import '~/src/server/plugins/engine/components/FormComponent.js'
import '~/src/server/plugins/engine/components/helpers-pure.js'

// Bad branches
// FileUploadField
// import { render } from '~/src/server/plugins/nunjucks/index.js'
// import '~/src/server/plugins/engine/components/FileUploadField.js'

import '~/src/server/common/helpers/logging/logger-options.js'
import '~/src/server/common/helpers/logging/logger.js'
import '~/src/server/plugins/engine/components/AutocompleteField.js'
import '~/src/server/plugins/engine/components/CheckboxesField.js'
import '~/src/server/plugins/engine/components/ComponentCollection.js'
import '~/src/server/plugins/engine/components/DatePartsField.js'
import '~/src/server/plugins/engine/components/Details.js'
import '~/src/server/plugins/engine/components/EmailAddressField.js'

// This is the problem
// import { render } from '~/src/server/plugins/nunjucks/index.js'

import '~/src/server/plugins/engine/components/FileUploadField.js'
import '~/src/server/plugins/engine/components/Html.js'
import '~/src/server/plugins/engine/components/InsetText.js'
import '~/src/server/plugins/engine/components/List.js'
import '~/src/server/plugins/engine/components/ListFormComponent.js'
import '~/src/server/plugins/engine/components/Markdown.js'
import '~/src/server/plugins/engine/components/MonthYearField.js'
import '~/src/server/plugins/engine/components/MultilineTextField.js'
import '~/src/server/plugins/engine/components/NumberField.js'
import '~/src/server/plugins/engine/components/RadiosField.js'
import '~/src/server/plugins/engine/components/SelectField.js'
import '~/src/server/plugins/engine/components/SelectionControlField.js'
import '~/src/server/plugins/engine/components/TelephoneNumberField.js'
import '~/src/server/plugins/engine/components/TextField.js'
import '~/src/server/plugins/engine/components/UkAddressField.js'
import '~/src/server/plugins/engine/components/YesNoField.js'
import '~/src/server/plugins/engine/components/helpers.js'
import '~/src/server/plugins/engine/components/index.js'
// import '~/src/server/plugins/engine/configureEnginePlugin.js'
// import '~/src/server/plugins/engine/evaluate-template.js'
import '~/src/server/plugins/engine/helpers.js'
// import '~/src/server/plugins/engine/index.js'
// import '~/src/server/plugins/engine/models/FormModel.js'
// import '~/src/server/plugins/engine/models/SummaryViewModel.js'
// import '~/src/server/plugins/engine/models/index.js'
// import '~/src/server/plugins/engine/outputFormatters/human/v1.js'
// import '~/src/server/plugins/engine/outputFormatters/index.js'
// import '~/src/server/plugins/engine/outputFormatters/machine/v1.js'

// import '~/src/server/plugins/engine/outputFormatters/machine/v2.js'
import '~/src/server/plugins/engine/pageControllers/FileUploadPageController.js'
import '~/src/server/plugins/engine/pageControllers/PageController.js'
import '~/src/server/plugins/engine/pageControllers/helpers-pure.js'
import '~/src/server/plugins/engine/pageControllers/QuestionPageController.js'
// import '~/src/server/plugins/engine/pageControllers/RepeatPageController.js'
import '~/src/server/plugins/engine/pageControllers/StartPageController.js'
import '~/src/server/plugins/engine/pageControllers/StatusPageController.js'
// import '~/src/server/plugins/engine/pageControllers/SummaryPageController.js'
import '~/src/server/plugins/engine/pageControllers/TerminalPageController.js'
// import '~/src/server/plugins/engine/pageControllers/helpers.js'
// import '~/src/server/plugins/engine/pageControllers/index.js'

// import '~/src/server/plugins/engine/plugin.js'
// import '~/src/server/plugins/engine/services/formSubmissionService.js'
// import '~/src/server/plugins/engine/services/index.js'
import '~/src/server/plugins/engine/services/localFormsService.js'
// import '~/src/server/plugins/engine/services/notifyService.js'
// import '~/src/server/plugins/engine/services/uploadService.js'
// import '~/src/server/plugins/nunjucks/context.js'
// import '~/src/server/plugins/nunjucks/environment.js'
// import '~/src/server/plugins/nunjucks/filters/answer.js'
// import '~/src/server/plugins/nunjucks/filters/evaluate.js'

// import '~/src/server/plugins/nunjucks/filters/href.js'
// import '~/src/server/plugins/nunjucks/filters/index.js'

// import '~/src/server/plugins/nunjucks/index.js'
// import '~/src/server/plugins/nunjucks/plugin.js'
// import '~/src/server/plugins/nunjucks/render.js'

import '~/src/server/schemas/index.js'
import '~/src/server/services/cacheService.js'
// import '~/src/server/services/httpService.js'
import '~/src/server/services/index.js'

// import '~/src/server/utils/notify.js'

import '~/src/server/utils/utils.js'
