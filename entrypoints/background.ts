import { onMessage } from '@/lib/message'

export default defineBackground(() => {
  onMessage('openOptions', () => browser.runtime.openOptionsPage())
})
