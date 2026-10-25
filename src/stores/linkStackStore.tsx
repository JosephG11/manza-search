'use client'

import { create } from 'zustand'

export type LinkStackActions = {
  setOpen: (open: boolean) => void
}

export type LinkStackState = {
  open: boolean
  actions: LinkStackActions
}

const useLinkStackStore = create<LinkStackState>((set) => ({
  open: false,
  actions: {
    setOpen: (open) => set({ open }),
  },
}))

export const useLinkStackOpen = () => useLinkStackStore((state) => state.open)

export const useLinkStackActions = () => useLinkStackStore((state) => state.actions)
