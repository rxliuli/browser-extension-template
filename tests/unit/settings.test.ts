import { beforeEach, describe, expect, it } from 'vitest'
import { fakeBrowser } from 'wxt/testing/fake-browser'
import { panelMessage, savePanelMessage } from '@/lib/settings'

describe('panel message', () => {
  beforeEach(() => {
    fakeBrowser.reset()
  })

  it('falls back to the default', async () => {
    expect(await panelMessage.getValue()).toBe('Hello World!')
  })

  it('saves trimmed text', async () => {
    await savePanelMessage('  Hi there  ')
    expect(await panelMessage.getValue()).toBe('Hi there')
  })

  it('resets to the default on empty input', async () => {
    await savePanelMessage('Hi')
    await savePanelMessage('   ')
    expect(await panelMessage.getValue()).toBe('Hello World!')
  })
})
