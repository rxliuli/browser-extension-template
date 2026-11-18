import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { sendMessage } from '@/lib/message'
import { panelMessage } from '@/lib/settings'
import { SettingsIcon, XIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

function usePanelMessage() {
  const [value, setValue] = useState<string>()
  useEffect(() => {
    void panelMessage.getValue().then(setValue)
    return panelMessage.watch(setValue)
  }, [])
  return value
}

export function Panel(props: { onClose(): void }) {
  const message = usePanelMessage()
  return (
    <div className="fixed top-4 right-4 z-[2147483647] w-80">
      <Card data-testid="panel">
        <CardHeader>
          <CardTitle>{browser.runtime.getManifest().name}</CardTitle>
          <CardDescription>Injected into this page on demand.</CardDescription>
          <CardAction>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close"
              onClick={props.onClose}
            >
              <XIcon className="size-4" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <p data-testid="panel-message">{message}</p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button onClick={() => toast.success('Hello from the panel')}>
            Toast
          </Button>
          <Button variant="secondary" onClick={() => void sendMessage('openOptions')}>
            <SettingsIcon className="size-4" />
            Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
