import { storage } from 'wxt/utils/storage'

/** Text the in-page panel shows. Edited on the options page. */
export const panelMessage = storage.defineItem<string>('local:panelMessage', {
  fallback: 'Hello World!',
})

/** Empty or whitespace-only input falls back to the default message. */
export async function savePanelMessage(input: string) {
  const text = input.trim()
  if (text) {
    await panelMessage.setValue(text)
  } else {
    await panelMessage.removeValue()
  }
}
