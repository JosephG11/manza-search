import { ImagePlaceholder } from '@/features/shared/components/ImagePlaceholder'
import { CMSLink } from '@/components/Link'
import { RenderMedia } from '@/features/shared/components/RenderMedia'
import { PromoBlock as PromoBlockProps } from '@/payload-types'
import { isValidLink } from '@/utilities/isValidLink'
import clsx from 'clsx'
import React from 'react'

const PromoBlock: React.FC<PromoBlockProps> = (props) => {
  const { title, content } = props

  return (
    <div className="flex w-full flex-col items-center">
      <div
        className={clsx(
          'w-[95%] border-4 border-black bg-primary-blue shadow-[10px_10px_10px_black]',
          'font-serif text-white',
          'pl-2',
        )}
      >
        {title}
      </div>

      <div className="flex max-w-[1075px] flex-wrap justify-center gap-10 px-4 py-12 lg:gap-2 xl:gap-8 2xl:gap-14">
        {content && content.length > 0 ? (
          content.map(({ id, link, media }) => {
            const hasValidLink = isValidLink(link)

            return (
              <div
                key={id}
                className="w-64 rounded-primary border-[3px] border-black bg-black shadow-[10px_10px_10px_black] hover:border-red-500"
              >
                <div
                  className={clsx(
                    'relative h-40 w-full flex-shrink-0 overflow-hidden rounded-md border-b-[3px] border-white',
                  )}
                >
                  {hasValidLink ? (
                    <CMSLink {...link}>
                      {media ? <RenderMedia media={media} /> : <ImagePlaceholder />}
                    </CMSLink>
                  ) : media ? (
                    <RenderMedia media={media} />
                  ) : (
                    <ImagePlaceholder />
                  )}
                </div>

                <div className="h-8 w-full rounded-b-primary pt-1">
                  <span className="ml-6 line-clamp-1 overflow-hidden font-serif text-white">
                    {link?.url}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="py-4 text-center">No content available</div>
        )}
      </div>
    </div>
  )
}

export default PromoBlock
