import { Button } from '@/components/ui/button'
import { PopoverContent } from '@/components/ui/popover'
import { ListsButtonAuthenticated } from './ArticleTopMenu/Lists/ListsButtonAuthenticated'
import { ExtraContentPopoverMenuProps } from '../types'

export function ExtraContentPopoverMenu({
  menuItems,
  content,
  isSignedIn,
  contentType,
  external,
}: ExtraContentPopoverMenuProps) {
  return (
    <PopoverContent className="flex w-40 flex-col items-center border-2 border-black">
      <div className="font-serif text-lg font-bold text-secondary-blue">Extra Content</div>
      <ul className="flex w-full flex-col items-center">
        {content && typeof content === 'object' && (
          <li className="w-full">
            <ListsButtonAuthenticated
              content={content}
              contentType={contentType}
              external={external}
            >
              <Button
                variant="ghost"
                className="w-full font-serif font-bold"
                disabled={!isSignedIn}
              >
                list
              </Button>
            </ListsButtonAuthenticated>
          </li>
        )}

        {menuItems.map(({ name, onClick, disabled }) => {
          return (
            <li key={name} className="w-full">
              <Button
                onClick={onClick}
                variant="ghost"
                className="w-full font-serif font-bold"
                disabled={disabled}
              >
                {name}
              </Button>
            </li>
          )
        })}
      </ul>
    </PopoverContent>
  )
}
