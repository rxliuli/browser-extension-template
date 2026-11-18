import { defineConfig, type UserManifest } from 'wxt'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  modules: ['@wxt-dev/module-react', '@extport/wxt'],
  extport: {
    extension: 'ext_YOUR_EXTENSION_ID',
    // Daily anonymous usage ping + the Firefox data-collection declaration,
    // injected by @extport/wxt. Opt-in; fill the store data-disclosure forms
    // before shipping it: https://github.com/rxliuli/extport/blob/main/docs/analytics-design.md
    // analytics: true,
    // Publishing to Safari? Uncomment and fill in your own values —
    // extport.config.json is generated from these at `wxt prepare`.
    // safari: {
    //   appCategory: 'public.app-category.productivity',
    //   bundleIdentifier: 'com.example.your-extension',
    //   developmentTeam: 'YOUR_TEAM_ID',
    //   // App Store Connect API key, used to upload builds.
    //   issuerId: 'YOUR_ISSUER_ID',
    //   keyId: 'YOUR_KEY_ID',
    //   openProject: true,
    // },
  },
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      tsconfigPaths: true,
    },
  }),
  manifestVersion: 3,
  manifest: (env) => {
    const manifest: UserManifest = {
      name: 'Browser Extension Template',
      description:
        'A template for WXT, a WebExtension framework based on Vite and React',
      // No host permissions: installing shows no permission warning.
      // `activeTab` grants the current tab when the user clicks the toolbar
      // button, which is enough for `scripting` to inject the panel. If a
      // feature needs specific sites, declare them in
      // `optional_host_permissions` and request them from a click.
      permissions: ['storage', 'activeTab', 'scripting'],
      author: {
        email: 'rxliuli@gmail.com',
      },
      action: {
        default_icon: {
          '16': 'icon/16.png',
          '32': 'icon/32.png',
          '48': 'icon/48.png',
          '96': 'icon/96.png',
          '128': 'icon/128.png',
        },
      },
      homepage_url: 'https://rxliuli.com/project/browser-extension-template',
    }
    if (env.mode === 'e2e') {
      // Tests cannot click the toolbar button or a permission prompt, so the
      // test build (`wxt build --mode e2e`) is granted every site up front.
      manifest.host_permissions = ['<all_urls>']
    }
    if (env.browser === 'firefox') {
      manifest.browser_specific_settings = {
        gecko: {
          id:
            manifest.name!.toLowerCase().replaceAll(/[^a-z0-9]/g, '-') +
            '@rxliuli.com',
          data_collection_permissions: {
            required: ['none'],
          },
        },
        // Empty = compatible with Firefox for Android at AMO's default
        // minimum — compatibility is a property of the build, not a
        // submission-time checkbox.
        gecko_android: {},
      }
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/author
      // @ts-expect-error
      manifest.author = 'rxliuli'
    }
    if (env.browser === 'safari') {
      // The name becomes the generated app's name and bundle paths. Keep it
      // plain (no dashes or subtitles): under a long name Safari loaded none
      // of the extension's resources.
      manifest.name = 'Browser Extension Template'
    }
    return manifest
  },
  webExt: {
    disabled: true,
  },
})
