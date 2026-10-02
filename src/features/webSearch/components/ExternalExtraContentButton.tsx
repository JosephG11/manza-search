'use client'

import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useMutationState } from '@/hooks/useMutationState'
import { useAuth } from '@clerk/nextjs'
import { ConvexError } from 'convex/values'
import { toast } from 'sonner'
import { api } from '../../../../convex/_generated/api'
import { ExtraContentPopoverMenu } from '@/features/articles/components/ExtraContentPopoverMenu'
import type { ExternalContentInput } from '@/features/filo/types'

type ExternalExtraContentButtonProps = {
  contentType: 'link' | 'video'
  item: ExternalContentInput
  className?: string
}

const LABELS = { link: 'Link', video: 'Video' }

export function ExternalExtraContentButton({
  contentType,
  item,
  className,
}: ExternalExtraContentButtonProps) {
  const { mutate: saveItem, pending: savePending } = useMutationState(api.save.saveContent)
  const { mutate: pinItem, pending: pinPending } = useMutationState(api.pin.pinContent)
  const { isSignedIn } = useAuth()

  const label = LABELS[contentType]

  async function handleSave() {
    await saveItem({ contentId: item.url, contentType, external: item })
      .then(() => toast.success(`${label} saved!`))
      .catch((error) =>
        toast.error(error instanceof ConvexError ? error.data : 'Unexpected error occurred'),
      )
  }

  async function handlePin() {
    await pinItem({ contentId: item.url, contentType, external: item })
      .then(() => toast.success(`${label} pinned!`))
      .catch((error) =>
        toast.error(error instanceof ConvexError ? error.data : 'Unexpected error occurred'),
      )
  }

  const menuItems = [
    { name: 'pin', onClick: handlePin, disabled: !isSignedIn || pinPending },
    { name: 'save', onClick: handleSave, disabled: !isSignedIn || savePending },
    { name: 'download', onClick: () => {}, disabled: true },
    { name: 'share', onClick: () => {}, disabled: true },
  ]

  const buttonClassName =
    className ?? 'absolute bottom-2 right-2 h-fit rounded-full bg-red-600 px-2.5 py-1'

  if (!isSignedIn) {
    const classes = buttonClassName.split(' ')
    const isPosition = (c: string) => c === 'absolute' || /^(top|right|bottom|left)-/.test(c)

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={classes.filter(isPosition).join(' ')}>
            <Button
              aria-label={`${label} extra content`}
              className={classes.filter((c) => !isPosition(c)).join(' ')}
              disabled
            >
              e
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>You must be logged in to use this</TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label={`${label} extra content`}
          className={buttonClassName}
        >
          e
        </Button>
      </PopoverTrigger>

      <ExtraContentPopoverMenu
        menuItems={menuItems}
        content={{ id: item.url }}
        isSignedIn={isSignedIn}
        contentType={contentType}
        external={item}
      />
    </Popover>
  )
}
