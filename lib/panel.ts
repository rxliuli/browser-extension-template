/**
 * Injects the in-page panel (entrypoints/content) into a tab. It is
 * registered at runtime instead of in the manifest, so the extension needs no
 * host permission: `activeTab` grants the current tab once the user opens
 * the popup.
 */
export async function showPanel(tabId: number) {
  await browser.scripting.executeScript({
    target: { tabId },
    files: ['/content-scripts/content.js'],
  })
}
