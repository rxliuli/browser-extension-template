# Conventions

## Permissions

- Ask for as little as possible; installing should show no permission warning.
- Prefer `activeTab` + `scripting` (inject from a user click) over `host_permissions` or manifest `content_scripts`.
- When specific sites are needed, declare them in `optional_host_permissions` and call `permissions.request` from a click. Nothing may be awaited before the request, or it is no longer part of the user gesture. Firefox closes the popup while its prompt is open, so save state before awaiting the answer.
- Content scripts with `registration: 'runtime'` must not set `matches`: WXT adds them to `host_permissions`.

## Content script UI

- Mount with `createShadowRootUi`, inline styles with `addStyle` (it rewrites `:root` to `:host`), and use `position: 'inline'` with a `fixed` element for floating UI. `'modal'` covers the page and blocks clicks.
- Radix portals render into `document.body` by default. Pass `getShadowRoot()` as their `container`.
- Injecting the same content script again invalidates the previous context, which removes its UI before the new `main` runs.

## Styling

- One stylesheet, `assets/style.css`, follows the system theme through `prefers-color-scheme`.
- Every HTML page needs `<meta name="color-scheme" content="light dark">`, or Safari stays light.
- Popups become full-width sheets on touch screens. Use `pointer-coarse:` variants to enlarge text there.

## Safari

- Keep `manifest.name` plain for Safari (see `wxt.config.ts`). It becomes the app name and its bundle paths.

## Tests

- `tests/unit`: pure logic and storage. `WxtVitest()` provides an in-memory `browser.*` (`fakeBrowser.reset()` between tests).
- `tests/e2e`: real Chromium loading `.output/chrome-mv3-e2e`. Drive `chrome.*` through `h.worker().evaluate(...)`, open extension pages with `h.openExtensionPage`, and serve fake sites on `*.test` hosts.
- `wxt build --mode e2e` grants `<all_urls>`, because tests cannot click permission prompts or the toolbar button.
- Use `h.stopServiceWorker()` to check that a feature survives the MV3 worker being killed.
