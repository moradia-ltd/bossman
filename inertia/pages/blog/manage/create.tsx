import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link, useForm } from '@inertiajs/react'
import { IconPlus } from '@tabler/icons-react'

import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { MarkdownEditor } from '@/components/blog/markdown-editor'
import { FormField } from '@/components/ui/form_field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

const COVER_PHOTO_OPTIONS = [
  { value: false, label: 'Upload photo', description: 'Upload an image file' },
  { value: true, label: 'Link', description: 'Use an image URL' },
] as const

interface BlogAdminCreateProps extends SharedProps {}

export default function BlogAdminCreate(_props: BlogAdminCreateProps) {
  const { data, setData, post, processing, errors } = useForm<{
    title: string
    body: string
    excerpt: string
    isUploadedPhotoLink: boolean
    coverImageAltUrl: string
    coverImage: File | null
    publish: boolean
  }>({
    title: '',
    body: '',
    excerpt: '',
    isUploadedPhotoLink: false,
    coverImageAltUrl: '',
    coverImage: null,
    publish: false,
  })

  const submit = () => {
    post('/blog/manage', { preserveScroll: true })
  }

  return (
    <DashboardLayout>
      <Head title='New blog post' />
      <div className='space-y-6'>
        <PageHeader
          backHref='/blog/manage'
          title='New post'
          description='Create a post. Slug is auto-generated from the title.'
        />

        <Card>
          <CardHeader>
            <CardTitle>Post</CardTitle>
            <CardDescription>Slug is auto-generated from the title.</CardDescription>
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
                      Publish now
                    </Label>
                  </div>
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  type='submit'
                  leftIcon={<IconPlus />}
                  isLoading={processing}
                  loadingText='Creating…'>
                  Create post
                </Button>
                <Button type='button' variant='outline' asChild>
                  <Link href='/blog/manage'>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
