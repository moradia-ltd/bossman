import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link, router, useForm } from '@inertiajs/react'
import { IconDeviceFloppy, IconTrash } from '@tabler/icons-react'

import type { RawBlogPost } from '#types/model-types'
import { COVER_PHOTO_OPTIONS, getInitialIsUploadedPhotoLink } from '@/components/blog'
import { MarkdownEditor } from '@/components/blog/markdown-editor'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { FormField } from '@/components/ui/form_field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'


interface BlogAdminEditProps extends SharedProps {
  post: RawBlogPost
}

export default function BlogAdminEdit({ post }: BlogAdminEditProps) {
  const { data, setData, put, processing, errors } = useForm<{
    title: string
    body: string
    excerpt: string
    isUploadedPhotoLink: boolean
    coverImageAltUrl: string
    coverImage: File | null
    publish: boolean
  }>({
    title: post.title,
    body: typeof post.body === 'string' ? post.body : '',
    excerpt: post.excerpt || '',
    isUploadedPhotoLink: getInitialIsUploadedPhotoLink(post),
    coverImageAltUrl: post.coverImageAltUrl || '',
    coverImage: null,
    publish: Boolean(post.publishedAt),
  })

  const submit = () => {
    put(`/blog/manage/${post.id}`, { preserveScroll: true })
  }

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
            <CardDescription>Update fields.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit()
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
                  label='Excerpt'
                  htmlFor='excerpt'
                  error={errors.excerpt}
                  className='md:col-span-2'>
                  <Textarea
                    id='excerpt'
                    value={data.excerpt}
                    onChange={(e) => setData('excerpt', e.target.value)}
                    rows={3}
                  />
                </FormField>

                <FormField
                  label='Body'
                  htmlFor='body'
                  error={errors.body}
                  className='md:col-span-2'>
                  <MarkdownEditor
                    key={post.id}
                    editorKey={String(post.id)}
                    value={data.body}
                    onChange={(markdown) => setData('body', markdown)}
                  />
                </FormField>

                <div className='md:col-span-2 space-y-4'>
                  <Label>Cover photo</Label>
                  <RadioGroup
                    options={COVER_PHOTO_OPTIONS.map((o) => ({
                      value: String(o.value),
                      label: o.label,
                      description: o.description,
                    }))}
                    value={String(data.isUploadedPhotoLink)}
                    onChange={(value) => setData('isUploadedPhotoLink', value === 'true')}
                    cols={2}
                  />
                  {!data.isUploadedPhotoLink ? (
                    <div className='space-y-3'>
                      <FormField
                        label='Image file'
                        htmlFor='coverImage'
                        error={(errors as Record<string, string | undefined>).coverImage}>
                        <Input
                          id='coverImage'
                          type='file'
                          accept='image/*'
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            setData('coverImage', file ?? null)
                          }}
                        />
                      </FormField>
                      <FormField
                        label='Alt text'
                        htmlFor='coverImageAltUrl'
                        error={(errors as Record<string, string | undefined>).coverImageAltUrl}>
                        <Input
                          id='coverImageAltUrl'
                          value={data.coverImageAltUrl}
                          onChange={(e) => setData('coverImageAltUrl', e.target.value)}
                          placeholder='Describe the image for accessibility'
                        />
                      </FormField>
                    </div>
                  ) : (
                    <FormField
                      label='Image URL'
                      htmlFor='coverImageAltUrl'
                      error={(errors as Record<string, string | undefined>).coverImageAltUrl}>
                      <Input
                        id='coverImageAltUrl'
                        type='url'
                        value={data.coverImageAltUrl}
                        onChange={(e) => setData('coverImageAltUrl', e.target.value)}
                        placeholder='https://…'
                      />
                    </FormField>
                  )}
                </div>

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
