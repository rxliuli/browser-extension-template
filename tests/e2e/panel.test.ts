import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Page } from 'playwright'
import type { browser } from 'wxt/browser'
import { launch, type Harness } from './harness'

declare const chrome: typeof browser

let h: Harness

beforeEach(async () => {
  h = await launch()
})

afterEach(async () => {
  await h.close()
})

/**
 * What the popup's button does (lib/panel.ts). A test cannot click the
 * toolbar button, so it calls `scripting` from the service worker instead;
 * the e2e build's host permissions stand in for `activeTab`.
 */
async function showPanel(page: Page) {
  const tabId = await h.tabId(page)
  await (await h.worker()).evaluate(
    (id) =>
      chrome.scripting
        .executeScript({
          target: { tabId: id },
          files: ['/content-scripts/content.js'],
        })
        .then(() => {}),
    tabId,
  )
}

async function openSite() {
  const page = await h.context.newPage()
  await page.goto(h.site('a'))
  return page
}

describe('panel', () => {
  it('renders inside a shadow root with the extension styles', async () => {
    const page = await openSite()
    await showPanel(page)

    const panel = page.getByTestId('panel')
    await expect.poll(() => panel.isVisible()).toBe(true)
    expect(await page.getByTestId('panel-message').textContent()).toBe(
      'Hello World!',
    )
    // Tailwind's `fixed` from the shadow root's own stylesheet applies, and
    // the page's styles stay untouched.
    expect(
      await panel.evaluate(
        (el) => getComputedStyle(el.parentElement!).position,
      ),
    ).toBe('fixed')
    expect(await page.locator('body > style').count()).toBe(0)
    // The page around the panel stays clickable.
    await page.locator('h1').click({ timeout: 2000 })
  })

  it('closes from its button and toggles on a second injection', async () => {
    const page = await openSite()
    await showPanel(page)
    await page.getByRole('button', { name: 'Close' }).click()
    await expect.poll(() => page.locator('extension-panel').count()).toBe(0)

    await showPanel(page)
    await expect.poll(() => page.locator('extension-panel').count()).toBe(1)
    await showPanel(page)
    await expect.poll(() => page.locator('extension-panel').count()).toBe(0)
  })

  it('shows the message saved on the options page', async () => {
    const options = await h.openExtensionPage('options.html')
    const input = options.getByLabel('Panel message')
    await expect.poll(() => input.isEnabled()).toBe(true)
    await input.fill('Saved from options')
    await options.getByRole('button', { name: 'Save' }).click()
    await options.getByText('Saved', { exact: true }).waitFor()

    const page = await openSite()
    await showPanel(page)
    await expect
      .poll(() => page.getByTestId('panel-message').textContent())
      .toBe('Saved from options')

    // The open panel follows later changes.
    await input.fill('Changed')
    await options.getByRole('button', { name: 'Save' }).click()
    await expect
      .poll(() => page.getByTestId('panel-message').textContent())
      .toBe('Changed')
  })

  it('opens the options page through the background, even after it was stopped', async () => {
    const page = await openSite()
    await showPanel(page)
    await h.stopServiceWorker()

    const opened = h.context.waitForEvent('page', {
      predicate: (p) => p.url().endsWith('/options.html'),
    })
    await page.getByRole('button', { name: 'Settings' }).click()
    await opened
  })
})
