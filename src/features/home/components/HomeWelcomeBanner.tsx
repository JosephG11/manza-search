'use client'
import React from 'react'
import { useUser } from '@clerk/nextjs'

export function HomeWelcomeBanner() {
  const { isLoaded, user } = useUser()

  const name = isLoaded && user && user.firstName ? user.firstName : ''

  return (
    <div className="mx-auto flex w-3/4 justify-center rounded-b-[10px] bg-black md:w-1/2 xl:w-1/3">
      <h2 className="py-2 text-center font-serif text-xl uppercase text-white">
        Welcome
        <span className="ml-1">{name}</span>!
      </h2>
    </div>
  )
}
