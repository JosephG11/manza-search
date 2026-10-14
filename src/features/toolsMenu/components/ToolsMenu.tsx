import { Bell, Settings } from 'lucide-react'
import type { ReactNode } from 'react'

type MenuItem = {
  id: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

const menuItems: MenuItem[] = [
  {
    id: '1',
    label: 'Subscrip',
  },
  {
    id: '2',
    label: 'contact',
  },
  {
    id: '3',
    label: 'Terms&service',
  },
  {
    id: '4',
    label: 'Privacy',
  },
  {
    id: '5',
    label: 'helpW',
  },
  {
    id: '6',
    label: 'Manza Settings',
    icon: <Settings className="size-6" aria-hidden />,
  },
  {
    id: '7',
    label: 'ManzaE',
  },
  {
    id: '8',
    label: 'Advert',
  },
  {
    id: '9',
    label: 'For Business',
  },
  {
    id: '10',
    label: 'Notifications',
    icon: <Bell className="size-6" aria-hidden />,
    disabled: true,
  },
]

export function ToolsMenu() {
  return (
    <div className="space-y-6">
      <div className="w-full text-center font-serif text-3xl">Tools</div>

      <div className="grid w-full grid-cols-2 gap-y-4 sm:grid-cols-3">
        {menuItems.map(({ label, id, icon, disabled }) => {
          return (
            <button
              key={id}
              disabled={disabled}
              title={disabled ? 'Em breve' : undefined}
              className="flex flex-col items-center gap-2 hover:text-secondary-blue disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-inherit"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-300 p-2 text-2xl text-white">
                {icon ?? 'PP'}
              </div>

              <div className="whitespace-nowrap font-serif capitalize">{label}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
