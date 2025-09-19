import { getJson } from '~/src/server/services/httpService.js'

const apiKey = ''

/**
 * OS places search
 * @param {string} query - the search term
 */
export async function search(query) {
  const url = `https://api.os.uk/search/places/v1/find?query=${encodeURIComponent(query)}&key=${apiKey}`

  const response = await getJson(url)

  return response.payload.results.map((result) => result.DPA)
}
