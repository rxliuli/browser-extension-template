import { ShadowProvider } from '@/integrations/shadow/ShadowProvider'
import { Toaster } from 'sonner'
import { Panel } from './Panel'

export function App(props: { container: HTMLElement; onClose(): void }) {
  return (
    <ShadowProvider container={props.container}>
      <Toaster richColors={true} closeButton={true} theme="system" />
      <Panel onClose={props.onClose} />
    </ShadowProvider>
  )
}
