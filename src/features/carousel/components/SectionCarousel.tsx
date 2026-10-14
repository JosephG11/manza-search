'use client'

import { useRef, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Carousel,
  CarouselContent,
  CarouselDotButtons,
  CarouselItem,
} from '@/components/ui/carousel'
import { Button } from '@/components/ui/button'
import { getErrorMessage } from '@/features/indexBrowser/errors'
import type { IndexSection } from '@/features/indexBrowser/types'
import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'

export function SectionCarousel({ section }: { section: IndexSection }) {
  const viewer = useQuery(api.indexBrowser.viewer)
  const images = useQuery(api.carousel.list, { section })
  const generateUploadUrl = useMutation(api.carousel.generateUploadUrl)
  const addImage = useMutation(api.carousel.add)
  const removeImage = useMutation(api.carousel.remove)

  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const isAdmin = viewer?.isAdmin === true

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploading(true)

    try {
      const uploadUrl = await generateUploadUrl()
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!res.ok) throw new Error('Upload failed')

      const { storageId } = (await res.json()) as { storageId: Id<'_storage'> }
      await addImage({ section, storageId })
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(imageId: Id<'carouselImages'>) {
    if (!window.confirm('Remove this image from the carousel?')) return

    await removeImage({ imageId }).catch((error: unknown) => toast.error(getErrorMessage(error)))
  }

  if (!images || (images.length === 0 && !isAdmin)) return null

  return (
    <div className="mt-1 flex w-full justify-center">
      <div className="w-full max-w-4xl rounded-[10px] bg-black px-2 pt-2">
        {images.length > 0 && (
          <Carousel>
            <CarouselContent className="-ml-1">
              {images.map((image) => (
                <CarouselItem key={image._id} className="pl-1 md:basis-1/2 lg:basis-1/3">
                  <div className="relative aspect-square border-2 border-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.url} alt="" loading="lazy" className="size-full object-cover" />

                    {isAdmin && (
                      <button
                        type="button"
                        aria-label="Remove image"
                        onClick={() => handleRemove(image._id)}
                        className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselDotButtons />
          </Carousel>
        )}

        {isAdmin && (
          <div className="flex justify-center py-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFile}
            />

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <ImagePlus className="mr-2 size-4" />
              {uploading ? 'Uploading…' : 'Add image'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
