'use client'

import { create } from 'zustand'
import type { ExternalContentInput, FiloContentType } from '@/features/filo/types'

type ContentType = FiloContentType | null

export type ListsActions = {
  setOpen: (open: boolean) => void
  setContentId: (contentId: string) => void
  setContentType: (contentType: ContentType) => void
  setExternal: (external?: ExternalContentInput) => void
}

export type ListsState = {
  open: boolean
  contentId: string | null
  contentType: ContentType
  external?: ExternalContentInput
  actions: ListsActions
}

const useListsStore = create<ListsState>((set) => ({
  open: false,
  contentId: null,
  contentType: null,
  actions: {
    setOpen: (open) => set({ open }),
    setContentId: (contentId) => set({ contentId }),
    setContentType: (contentType) => set({ contentType }),
    setExternal: (external) => set({ external }),
  },
}))

export const useListsOpen = () => useListsStore((state) => state.open)

export const useListsContentId = () => useListsStore((state) => state.contentId)

export const useListsContentType = () => useListsStore((state) => state.contentType)

export const useListsExternal = () => useListsStore((state) => state.external)

export const useListsActions = () => useListsStore((state) => state.actions)
