# Browser Extension Template

A browser extension template built with React, shadcn/ui, and WXT. Builds for Chrome, Edge, Firefox (desktop and Android), and Safari (requires macOS).

## Getting Started

```sh
git clone https://github.com/<your-github-username>/<your-project-name>.git
cd <your-project-name>
pnpm i
pnpm init-project
```

Follow the prompts to enter your project name. Then fill in the `extport` section of `wxt.config.ts`.

## What's included

- **Popup**: a button that injects the in-page panel into the current tab.
- **In-page panel**: a React UI in a shadow root, isolated from the page's styles, injected on demand with `activeTab` and `scripting`.
- **Options page**: edits a setting the panel reads and watches.
- **Background**: handles messages from content scripts.

Installing shows no permission warning. The extension asks for `storage`, `activeTab`, and `scripting` only, has no host permissions, and declares no content scripts in its manifest.

```
entrypoints/
  background.ts     message handlers
  popup/            toolbar popup
  options/          settings page
  content/          in-page panel (runtime registered)
lib/
  settings.ts       storage items
  message.ts        messaging protocol
  panel.ts          injecting the panel
assets/style.css    Tailwind and theme, shared by every UI
tests/
  unit/             pure logic and storage, with WXT's fake browser
  e2e/              real Chromium with the built extension loaded
```

## Development

```sh
pnpm dev          # Chrome, output in .output/chrome-mv3-dev
pnpm compile      # type check
pnpm test:unit
pnpm test:e2e
```

To load the dev build, open `chrome://extensions`, enable Developer mode, and load `.output/chrome-mv3-dev`.

The end-to-end tests build a test variant (`pnpm build:e2e`) that is granted every site in its manifest, because a test cannot click the toolbar button or a permission prompt. They need Playwright's Chromium: `pnpm exec playwright install chromium`.

## Build

```sh
pnpm zip && pnpm zip:firefox
pnpm build:safari   # macOS with Xcode
```

For Safari, fill in the `safari` section of `wxt.config.ts`, then build and test the generated Xcode project. Keep the Safari app name plain; see the comment in `wxt.config.ts`.

Releases are published by `.github/workflows/release.yaml` when the version in `package.json` changes.

## Requirements

- Node.js (latest LTS recommended)
- pnpm
- macOS with Xcode (for Safari only)
