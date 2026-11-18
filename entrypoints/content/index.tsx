import ReactDOM from 'react-dom/client'
import { App } from './App.tsx'
import styles from '@/assets/style.css?inline'
import sonnerStyles from 'sonner/dist/styles.css?inline'
import { addStyle } from '@/lib/addStyle.ts'

const TAG = 'extension-panel'

export default defineContentScript({
  // Injected on demand by `showPanel` (lib/panel.ts) rather than declared in
  // the manifest. Giving it `matches` would add them to host_permissions.
  registration: 'runtime',
  // Styles are inlined into the shadow root by `addStyle` below.
  cssInjectionMode: 'manual',

  async main(ctx) {
    // Every injection runs `main` again, and starting a new context removes
    // the previous one's UI before this point. The isolated world's globals
    // survive between injections, so a flag tells whether the panel was open:
    // a second click closes it.
    const state = globalThis as { __panelOpen?: boolean }
    if (state.__panelOpen) {
      state.__panelOpen = false
      return
    }

    const ui = await createShadowRootUi(ctx, {
      name: TAG,
      // The panel positions itself (`fixed` in Panel.tsx). 'modal' would
      // cover the whole page and block clicks on it.
      position: 'inline',
      anchor: 'body',
      onMount: (container, shadow) => {
        addStyle(shadow, [styles, sonnerStyles])
        // React warns about rendering into <body>, so use a wrapper.
        const app = document.createElement('div')
        container.append(app)
        const root = ReactDOM.createRoot(app)
        root.render(<App container={container} onClose={close} />)
        return root
      },
      onRemove: (root) => root?.unmount(),
    })
    const close = () => {
      state.__panelOpen = false
      ui.remove()
    }
    ui.mount()
    state.__panelOpen = true
  },
})
