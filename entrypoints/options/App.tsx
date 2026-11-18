import { useEffect, useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Toaster } from '@/components/ui/sonner'
import { panelMessage, savePanelMessage } from '@/lib/settings'

export function App() {
  const [input, setInput] = useState<string>()

  useEffect(() => {
    void panelMessage.getValue().then(setInput)
  }, [])

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await savePanelMessage(input ?? '')
    setInput(await panelMessage.getValue())
    toast.success('Saved')
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <Toaster />
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Open the panel from the toolbar button on any page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-2" onSubmit={(e) => void onSubmit(e)}>
            <Label htmlFor="message">Panel message</Label>
            <div className="flex gap-2">
              <Input
                id="message"
                value={input ?? ''}
                disabled={input === undefined}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
