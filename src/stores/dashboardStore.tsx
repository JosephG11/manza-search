'use client'

import { create } from 'zustand'

export type DashboardActions = {
  setOpen: (open: boolean) => void
}

export type DashboardState = {
  open: boolean
  actions: DashboardActions
}

const useDashboardStore = create<DashboardState>((set) => ({
  open: false,
  actions: {
    setOpen: (open) => set({ open }),
  },
}))

export const useDashboardOpen = () => useDashboardStore((state) => state.open)

export const useDashboardActions = () => useDashboardStore((state) => state.actions)
