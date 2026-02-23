import type { SharedProps } from '@adonisjs/inertia/types'
import { Deferred, Head, router, useForm } from '@inertiajs/react'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import type { RawBlogTag } from '#types/model-types'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { LoadingSkeleton } from '@/components/ui'
import { BaseModal } from '@/components/ui/base-modal'
import { Button } from '@/components/ui/button'
import { AppCard } from '@/components/ui/app-card'
import { FormField } from '@/components/ui/form_field'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/ui/stack'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface BlogAdminTagsProps extends SharedProps {
  tags?: RawBlogTag[]
}

export default function BlogAdminTags({ tags }: BlogAdminTagsProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
  })

  return (
    <DashboardLayout>
      <Head title='Blog tags' />
      <div className='space-y-6'>
        <PageHeader
          backHref='/blog/manage'
          title='Tags'
          description='Create and manage tags.'
          actions={
            <BaseModal
              title='New tag'
              description='Slug is generated automatically.'
              trigger={
                <Button leftIcon={<IconPlus />}>
                  Add tag
                </Button>
              }
              primaryText='Create tag'
              secondaryText='Cancel'
              primaryVariant='default'
              secondaryVariant='outline'
              isLoading={processing}
              primaryDisabled={processing}
              onSecondaryAction={() => reset()}
              onPrimaryAction={async () => {
                post('/blog/manage/tags', {
                  preserveScroll: true,
                  onSuccess: () => {
                    reset()
                  },
                })
              }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  post('/blog/manage/tags', {
                    preserveScroll: true,
                    onSuccess: () => {
                      reset()
                    },
                  })
                }}>
                <Stack spacing={4}>
                  <FormField label='Name' htmlFor='name' required error={errors.name}>
                    <Input id='name' value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                  </FormField>
                </Stack>
              </form>
            </BaseModal>
          }
        />

        <Deferred data="tags" fallback={<LoadingSkeleton type='table' />}>
          <AppCard title='All tags' description={`${(tags ?? []).length} total`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(tags ?? []).map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className='font-medium'>{t.name}</TableCell>
                    <TableCell className='text-muted-foreground'>/{t.slug}</TableCell>
                    <TableCell className='text-right'>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='text-destructive hover:text-destructive'
                        onClick={() => {
                          if (!confirm('Delete this tag?')) return
                          router.delete(`/blog/manage/tags/${t.id}`, { preserveScroll: true })
                        }}>
                        <IconTrash className='h-4 w-4' />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!(tags ?? []).length ? (
                  <TableRow>
                    <TableCell colSpan={3} className='text-center text-muted-foreground'>
                      No tags yet.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </AppCard>
        </Deferred>
      </div>
    </DashboardLayout>
  )
}

