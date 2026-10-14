import type { IndexNode } from '../types'

export function NodeCard({ node, onOpen }: { node: IndexNode; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex aspect-square w-full items-center justify-center rounded-lg bg-secondary-blue p-3 text-center font-serif text-white hover:bg-black"
    >
      {node.name}
    </button>
  )
}
