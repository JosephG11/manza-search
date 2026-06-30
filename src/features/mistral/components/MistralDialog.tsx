import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MistralButton } from './MistralButton'
import { MistralChat } from './MistralChat'
import { cn } from '@/utilities/ui'

export function MistralDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <MistralButton />
      </DialogTrigger>

      <DialogTitle className="sr-only">Mistral</DialogTitle>
      <DialogDescription className="sr-only">Mistral chat dialog content</DialogDescription>

      <DialogContent
        aria-description="Mistral chat dialog content"
        className={cn(
          'sm:px-6 md:h-[90%] md:max-w-[80%]',
          'h-full max-w-full px-0',
          'grid-rows-[minmax(0,1fr)] overflow-hidden',
          'border-black bg-menu',
        )}
        closeButtonStyles="text-white"
      >
        <MistralChat />
      </DialogContent>
    </Dialog>
  )
}
