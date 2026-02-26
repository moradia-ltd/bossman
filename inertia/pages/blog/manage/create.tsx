import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link, useForm } from '@inertiajs/react'
import { IconPlus } from '@tabler/icons-react'

import type { RawBlogCategory } from '#types/model-types'
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

interface BlogAdminCreateProps extends SharedProps {
  categories: RawBlogCategory[]
}

export default function BlogAdminCreate({ categories }: BlogAdminCreateProps) {
  const { data, setData, post, processing, errors } = useForm<{
    title: string
    summary: string
    content: string
    thumbnailUrl: string
    coverImageUrl: string
    categoryId: string | null
    publish: boolean
  }>({
    title: '',
    summary: '',
    content: '',
    thumbnailUrl: '',
    coverImageUrl: '',
    categoryId: null,
    publish: false,
  })

  return (
    <DashboardLayout>
      <Head title='New blog post' />
      <div className='space-y-6'>
        <PageHeader
          backHref='/blog/manage'
          title='New post'
          description='Create a post with category.'
        />

        <Card>
          <CardHeader>
            <CardTitle>Post</CardTitle>
            <CardDescription>Slug is generated automatically from the title.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                post('/blog/manage', { preserveScroll: true })
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
