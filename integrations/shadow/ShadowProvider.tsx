let _container: HTMLElement | null = null

/**
 * The element inside the panel's shadow root. Radix portals (dropdowns,
 * dialogs, popovers) render into `document.body` by default, outside the
 * shadow root and its styles; pass this as their `container` instead.
 */
export function getShadowRoot() {
  if (!_container) {
    throw new Error('Shadow root not found')
  }
  return _container
}

export function ShadowProvider(props: {
  children: React.ReactNode
  container: HTMLElement
}) {
  _container = props.container
  return props.children
}
