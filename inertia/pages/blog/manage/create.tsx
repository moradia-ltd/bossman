import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link, useForm } from '@inertiajs/react'
import { IconPlus } from '@tabler/icons-react'

import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { RichTextEditor, EMPTY_TIPTAP_DOC } from '@/components/blog/rich-text-editor'
import { FormField } from '@/components/ui/form_field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'

const COVER_PHOTO_OPTIONS = [
  { value: 'upload', label: 'Upload photo', description: 'Upload an image file' },
  { value: 'link', label: 'Link', description: 'Use an image URL' },
] as const

type CoverPhotoMode = (typeof COVER_PHOTO_OPTIONS)[number]['value']

interface BlogAdminCreateProps extends SharedProps {}

export default function BlogAdminCreate(_props: BlogAdminCreateProps) {
  const { data, setData, post, processing, errors } = useForm<{
    title: string
    body: Record<string, unknown> | unknown[]
    excerpt: string
    coverPhotoMode: CoverPhotoMode
    coverImageFile: File | null
    coverImageUrl: string
    coverImageAltText: string
    publish: boolean
  }>({
    title: '',
    body: EMPTY_TIPTAP_DOC,
    excerpt: '',
    coverPhotoMode: 'upload',
    coverImageFile: null,
    coverImageUrl: '',
    coverImageAltText: '',
    publish: false,
  })

  const submit = () => {
    post('/blog/manage', {
      preserveScroll: true,
      transform: (payload) => {
        const { coverImageFile, coverPhotoMode, coverImageUrl, coverImageAltText, ...rest } = payload
        const out: Record<string, unknown> = {
          ...rest,
          body: rest.body,
          coverImageAltUrl: coverPhotoMode === 'link' ? coverImageUrl : coverImageAltText,
        }
        if (coverImageFile instanceof File) out.coverImage = coverImageFile
        return out
      },
    })
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
                  <RichTextEditor
                    value={data.body}
                    onChange={(json) => setData('body', json)}
                    placeholder='Start writing…'
                  />
                </FormField>

                <div className='md:col-span-2 space-y-4'>
                  <Label>Cover photo</Label>
                  <RadioGroup
                    options={COVER_PHOTO_OPTIONS.map((o) => ({
                      value: o.value,
                      label: o.label,
                      description: o.description,
                    }))}
                    value={data.coverPhotoMode}
                    onChange={(value) => setData('coverPhotoMode', value as CoverPhotoMode)}
                    cols={2}
                  />
                  {data.coverPhotoMode === 'upload' ? (
                    <div className='space-y-3'>
                      <FormField
                        label='Image file'
                        htmlFor='coverImageFile'
                        error={errors.coverImage}>
                        <Input
                          id='coverImageFile'
                          type='file'
                          accept='image/*'
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            setData('coverImageFile', file ?? null)
                          }}
                        />
                      </FormField>
                      <FormField
                        label='Alt text'
                        htmlFor='coverImageAltText'
                        error={errors.coverImageAltUrl}>
                        <Input
                          id='coverImageAltText'
                          value={data.coverImageAltText}
                          onChange={(e) => setData('coverImageAltText', e.target.value)}
                          placeholder='Describe the image for accessibility'
                        />
                      </FormField>
                    </div>
                  ) : (
                    <FormField
                      label='Image URL'
                      htmlFor='coverImageUrl'
                      error={errors.coverImageAltUrl}>
                      <Input
                        id='coverImageUrl'
                        type='url'
                        value={data.coverImageUrl}
                        onChange={(e) => setData('coverImageUrl', e.target.value)}
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
