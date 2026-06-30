import { MOMenuButton } from '../../moreOptions/components/MOMenuButton'

export function MistralButton({ ...props }) {
  return (
    <MOMenuButton className="bg-[#fa520f]" aria-label="Open Mistral chat" {...props}>
      AI
    </MOMenuButton>
  )
}
