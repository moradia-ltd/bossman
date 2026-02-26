import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { IconDeviceFloppy, IconTrash } from '@tabler/icons-react'

import type { RawBlogCategory, RawBlogPost } from '#types/model-types'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField } from '@/components/ui/form_field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface BlogAdminEditProps extends SharedProps {
  post: RawBlogPost
  categories: RawBlogCategory[]
}

export default function BlogAdminEdit({ post, categories }: BlogAdminEditProps) {
  const { data, setData, put, processing, errors } = useForm<{
    title: string
    summary: string
    content: string
    thumbnailUrl: string
    coverImageUrl: string
    categoryId: string | null
    publish: boolean
  }>({
    title: post.title,
    summary: post.summary || '',
    content: post.content || '',
    thumbnailUrl: post.thumbnailUrl || '',
    coverImageUrl: post.coverImageUrl || '',
    categoryId: post.categoryId || null,
    publish: Boolean(post.publishedAt),
  })

  return (
    <DashboardLayout>
      <Head title={`Edit: ${post.title}`} />
      <div className='space-y-6'>
        <PageHeader
          backHref='/blog/manage'
          title='Edit post'
          description={`/${post.slug}`}
          actions={
            <Button variant='outline' asChild>
              <Link href={`/blog/${post.slug}`}>View</Link>
            </Button>
          }
        />

        <Card>
          <CardHeader>
            <CardTitle>Post</CardTitle>
            <CardDescription>Update fields and category.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                put(`/blog/manage/${post.id}`, { preserveScroll: true })
              }}
              className='space-y-6'>
              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  label='Title'
                  htmlFor='title'
                  required
                  error={errors.title}
                  className='md:col-span-2'>
                  <Input
                    id='title'
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    required
                  />
                </FormField>

                <FormField
                  label='Summary'
                  htmlFor='summary'
                  error={errors.summary}
                  className='md:col-span-2'>
                  <Textarea
                    id='summary'
                    value={data.summary}
                    onChange={(e) => setData('summary', e.target.value)}
                    rows={3}
                  />
                </FormField>

                <FormField
                  label='Content'
                  htmlFor='content'
                  error={errors.content}
                  className='md:col-span-2'>
                  <Textarea
                    id='content'
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    rows={10}
                  />
                </FormField>

                <FormField label='Thumbnail URL' htmlFor='thumbnailUrl' error={errors.thumbnailUrl}>
                  <Input
                    id='thumbnailUrl'
                    value={data.thumbnailUrl}
                    onChange={(e) => setData('thumbnailUrl', e.target.value)}
                    placeholder='https://...'
                  />
                </FormField>

                <FormField
                  label='Cover image URL'
                  htmlFor='coverImageUrl'
                  error={errors.coverImageUrl}>
                  <Input
                    id='coverImageUrl'
                    value={data.coverImageUrl}
                    onChange={(e) => setData('coverImageUrl', e.target.value)}
                    placeholder='https://...'
                  />
                </FormField>

                <FormField label='Category' error={errors.categoryId}>
                  <Select
                    value={data.categoryId ?? ''}
                    onValueChange={(value) => setData('categoryId', value ? value : null)}>
                    <SelectTrigger>
                      <SelectValue placeholder='None' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=''>None</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <div className='space-y-2'>
                  <Label>Publish</Label>
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      checked={data.publish}
                      onCheckedChange={(checked) => setData('publish', Boolean(checked))}
                      id='publish'
                    />
                    <Label htmlFor='publish' className='font-normal'>
                      Published
                    </Label>
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap items-center justify-between gap-2'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Button
                    type='submit'
                    leftIcon={<IconDeviceFloppy />}
                    isLoading={processing}
                    loadingText='Saving…'>
                    Save changes
                  </Button>
                  <Button type='button' variant='outline' asChild>
                    <Link href='/blog/manage'>Cancel</Link>
                  </Button>
                </div>
                <Button
                  type='button'
                  variant='destructive'
                  leftIcon={<IconTrash />}
                  onClick={() => {
                    if (!confirm('Delete this post?')) return
                    router.delete(`/blog/manage/${post.id}`, { preserveScroll: true })
                  }}>
                  Delete
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
