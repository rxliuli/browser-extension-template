import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { showPanel } from '@/lib/panel'

export function App() {
  const [error, setError] = useState<string>()

  const onShow = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true })
    try {
      await showPanel(tab!.id!)
      window.close()
    } catch {
      // Browser pages (chrome://, the web stores, about:) refuse injection.
      setError("The panel can't be shown on this page.")
    }
  }

  // Sizes are tuned for a desktop popup. On a touch screen the popup is a
  // full-width sheet, where the same sizes read as too small.
  return (
    <div className="min-w-72 space-y-3 p-4 text-sm pointer-coarse:text-base">
      <Button className="w-full" onClick={() => void onShow()}>
        Show panel on this page
      </Button>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <Button
        variant="link"
        className="h-auto p-0 text-xs pointer-coarse:text-sm"
        onClick={() => void browser.runtime.openOptionsPage()}
      >
        Settings
      </Button>
    </div>
  )
}
