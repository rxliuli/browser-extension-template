import { defineExtensionMessaging } from '@webext-core/messaging'

/** Requests sent from content scripts and pages to the background. */
export const { sendMessage, onMessage } = defineExtensionMessaging<{
  // Content scripts cannot call `runtime.openOptionsPage()` themselves.
  openOptions(): void
}>()
