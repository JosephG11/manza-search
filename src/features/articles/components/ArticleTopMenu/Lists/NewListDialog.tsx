'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useMutationState } from '@/hooks/useMutationState'
import {
  useListsActions,
  useListsContentId,
  useListsContentType,
  useListsExternal,
  useListsOpen,
} from '@/stores/listsStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { api } from '../../../../../../convex/_generated/api'
import { ConvexError } from 'convex/values'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

const listSchema = z.object({
  name: z.string().min(1, { message: "This field can't be empty" }),
})

export function NewListDialog() {
  const { mutate: createList, pending } = useMutationState(api.list.createListWithContent)

  const open = useListsOpen()
  const { setOpen } = useListsActions()
  const contentId = useListsContentId()
  const contentType = useListsContentType()
  const external = useListsExternal()

  const form = useForm<z.infer<typeof listSchema>>({
    resolver: zodResolver(listSchema),
    defaultValues: {
      name: '',
    },
  })

  async function handleSubmit(values: z.infer<typeof listSchema>) {
    try {
      await createList({
        name: values.name,
        contentId,
        contentType,
        external,
      })
      toast.success(`${values.name} list created!`)
      setOpen(false)
      form.reset()
    } catch (error) {
      toast.error(error instanceof ConvexError ? error.data : 'Unexpected error occurred')
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="border-black bg-menu" closeButtonStyles="text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Create a new list</DialogTitle>
          <DialogDescription className="">
            Item will be added to newly created list
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel className="text-white">Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            <DialogFooter>
              <Button
                type="button"
                onClick={() => {
                  form.reset()
                  setOpen(false)
                }}
                variant="outline"
                disabled={pending}
                className="bg-transparent text-white"
              >
                Cancel
              </Button>

              <Button disabled={pending} type="submit" className="bg-black hover:bg-neutral-900">
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
