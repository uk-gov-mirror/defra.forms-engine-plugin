/**
 * Returns internal and external components from a componentMap, regardless of error state.
 * @param componentMap - Map of component names to component instances
 * @returns An object containing internalComponents and externalComponents arrays
 */
export function getComponentsByType(
	componentMap: Map<string, unknown>
): { internalComponents: Map<string, unknown>; externalComponents: Map<string, unknown> } {
  const internalComponents = new Map<string, unknown>()
  const externalComponents = new Map<string, unknown>()

  for (const [name, component] of componentMap.entries()) {
    if (
      typeof (component as { getRoutes?: unknown }).getRoutes === 'function'
    ) {
      externalComponents.set(name, component)
    } else {
      internalComponents.set(name, component)
    }
  }

  return { internalComponents, externalComponents }
}
