'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { getErrorMessage } from '../errors'
import { useRequireSignIn } from '../hooks'

type InlineCreateBoxProps = {
  label: string
  maxLength: number
  onCreate: (name: string) => Promise<unknown>
}

export function InlineCreateBox({ label, maxLength, onCreate }: InlineCreateBoxProps) {
  const requireSignIn = useRequireSignIn()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const [pending, setPending] = useState(false)

  function close() {
    setEditing(false)
    setValue('')
  }

  async function submit() {
    const name = value.trim()
    if (!name || pending) return

    setPending(true)
    try {
      await onCreate(name)
      close()
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  if (!editing) {
    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => requireSignIn(() => setEditing(true))}
        className="flex h-10 w-10 items-center justify-center rounded bg-secondary-blue text-white hover:bg-black"
      >
        <Plus className="size-5" />
      </button>
    )
  }

  return (
    <Input
      autoFocus
      value={value}
      maxLength={maxLength}
      disabled={pending}
      placeholder={label}
      aria-label={label}
      className="h-10 w-44"
      onChange={(event) => setValue(event.target.value)}
      onBlur={() => !value.trim() && close()}
      onKeyDown={(event) => {
        if (event.key === 'Enter') void submit()
        if (event.key === 'Escape') close()
      }}
    />
  )
}
