import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Globals/Footer/Component'
import { Header } from '@/Globals/Header/Component'
import { ToolboxSlot } from '@/features/shared/components/ToolboxSlot'
import { FiloDialogGate } from '@/features/filo/FiloDialogGate'
import { DashboardDialog } from '@/features/dashboard/components/DashboardDialog'
import { LinkStackDialogGate } from '@/features/linkStack/components/LinkStackDialogGate'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <Providers>
      <html
        className={cn(GeistSans.variable, GeistMono.variable)}
        lang="en"
        suppressHydrationWarning
      >
        <head>
          <InitTheme />
          <link href="/favicon.ico" rel="icon" sizes="32x32" />
          <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        </head>
        <body>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <Header />
          {children}
          <ToolboxSlot />
          <FiloDialogGate />
          <DashboardDialog />
          <LinkStackDialogGate />
          <Footer />
        </body>
      </html>
    </Providers>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
}
