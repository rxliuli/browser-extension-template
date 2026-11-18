import { mkdtemp, rm } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import {
  chromium,
  type BrowserContext,
  type Page,
  type Worker,
} from 'playwright'
import type { browser } from 'wxt/browser'

/** Only exists inside the service worker, where `evaluate` callbacks run. */
declare const chrome: typeof browser

const EXTENSION_DIR = path.resolve(
  import.meta.dirname,
  '../../.output/chrome-mv3-e2e',
)

export interface Harness {
  context: BrowserContext
  /** URL on a fake site, e.g. `site('a', '/one')` -> http://a.test:PORT/one */
  site(name: string, pathname?: string): string
  /** The extension's service worker, for `evaluate` calls into `chrome.*`. */
  worker(): Promise<Worker>
  /** Opens an extension page such as `popup.html` or `options.html`. */
  openExtensionPage(file: string): Promise<Page>
  /** The id of the tab showing `page`. */
  tabId(page: Page): Promise<number>
  /** Kills the extension's service worker, as the browser does when idle. */
  stopServiceWorker(): Promise<void>
  close(): Promise<void>
}

/**
 * Every `*.test` host resolves to this server, so the fake sites need no
 * network. Change the page it serves to suit your tests.
 */
function startServer(): Promise<Server> {
  const server = createServer((req, res) => {
    res.setHeader('content-type', 'text/html')
    res.end(`<!doctype html><title>${req.headers.host}${req.url}</title>
<h1>${req.headers.host}${req.url}</h1>`)
  })
  return new Promise((resolve) =>
    server.listen(0, '127.0.0.1', () => resolve(server)),
  )
}

export async function launch(): Promise<Harness> {
  const server = await startServer()
  const port = (server.address() as AddressInfo).port
  const userDataDir = await mkdtemp(path.join(tmpdir(), 'extension-e2e-'))
  const context = await chromium.launchPersistentContext(userDataDir, {
    // The full Chromium build: the headless shell cannot load extensions.
    channel: 'chromium',
    headless: true,
    args: [
      `--disable-extensions-except=${EXTENSION_DIR}`,
      `--load-extension=${EXTENSION_DIR}`,
      '--host-resolver-rules=MAP *.test 127.0.0.1',
    ],
  })

  const isOurs = (w: Worker) => w.url().endsWith('/background.js')
  const worker = async (): Promise<Worker> =>
    context.serviceWorkers().find(isOurs) ??
    (await context.waitForEvent('serviceworker', { predicate: isOurs }))
  const extensionId = new URL((await worker()).url()).host

  return {
    context,
    worker,
    site: (name, pathname = '/') => `http://${name}.test:${port}${pathname}`,
    async openExtensionPage(file) {
      const page = await context.newPage()
      await page.goto(`chrome-extension://${extensionId}/${file}`)
      return page
    },
    async tabId(page) {
      const url = page.url()
      const tabs = await (await worker()).evaluate(
        (u) => chrome.tabs.query({ url: u }),
        url,
      )
      if (tabs.length !== 1) {
        throw new Error(`expected one tab at ${url}, found ${tabs.length}`)
      }
      return tabs[0]!.id!
    },
    async stopServiceWorker() {
      const page = context.pages()[0]
      if (!page) throw new Error('a page is needed to reach the worker')
      const cdp = await context.newCDPSession(page)
      const stopped = new Promise<void>((resolve) => {
        cdp.on('ServiceWorker.workerVersionUpdated', ({ versions }) => {
          if (versions.some((v) => v.runningStatus === 'stopped')) resolve()
        })
      })
      await cdp.send('ServiceWorker.enable')
      await cdp.send('ServiceWorker.stopAllWorkers')
      await stopped
      await cdp.detach()
    },
    async close() {
      await context.close()
      await new Promise((resolve) => server.close(resolve))
      await rm(userDataDir, { recursive: true, force: true })
    },
  }
}
