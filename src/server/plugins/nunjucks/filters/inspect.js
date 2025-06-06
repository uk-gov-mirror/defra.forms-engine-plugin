// import { inspect as utilInspec } from 'util'

/**
 * Format JavaScript objects as strings
 * @param {unknown} object - JavaScript object to format
 * @returns {string} Formatted string
 */
export function inspect(object) {
  return JSON.stringify(object)
  // return utilInspec(object, {
  //   compact: false,
  //   depth: Infinity,
  //   maxArrayLength: Infinity,
  //   maxStringLength: Infinity
  // })
}
