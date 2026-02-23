import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link, useForm } from '@inertiajs/react'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { useMemo } from 'react'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { AppCard } from '@/components/ui/app-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

interface QaTestingCreateProps extends SharedProps { }

type CheckItem = {
  id: string
  label: string
  checked: boolean
  notes?: string
}

type BugItem = {
  title: string
  stepsToReproduce: string
  expectedResult: string
  actualResult: string
  environment: 'dev' | 'staging' | 'production'
  reproducibleTwice: boolean
  evidenceLinks: string
  linearTicket: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

const functionalChecks: Omit<CheckItem, 'checked' | 'notes'>[] = [
  { id: 'input-fields', label: 'Input fields (required, optional, validation messages)' },
  { id: 'button-actions', label: 'Button actions' },
  { id: 'data-persistence', label: 'Data saving and persistence' },
  { id: 'redirections', label: 'Correct redirections' },
  { id: 'expected-output', label: 'Output matches expected behavior' },
]

const edgeChecks: Omit<CheckItem, 'checked' | 'notes'>[] = [
  { id: 'empty-fields', label: 'Boundary: empty fields' },
  { id: 'large-values', label: 'Boundary: large values' },
  { id: 'invalid-formats', label: 'Boundary: invalid formats' },
  { id: 'different-roles', label: 'Different user roles' },
  { id: 'unusual-behavior', label: 'Unusual but possible user behavior' },
]

const regressionChecks: Omit<CheckItem, 'checked' | 'notes'>[] = [
  { id: 'related-features', label: 'Related features still working' },
  { id: 'fixed-bugs', label: 'Previously fixed bugs still resolved' },
]

const crossEnvChecks: Omit<CheckItem, 'checked' | 'notes'>[] = [
  { id: 'staging-consistency', label: 'Behavior verified on Staging' },
  { id: 'production-consistency', label: 'Behavior verified on Production' },
  { id: 'browser-coverage', label: 'Browser coverage completed (if needed)' },
]

const uiChecks: Omit<CheckItem, 'checked' | 'notes'>[] = [
  { id: 'layout-alignment', label: 'Layout alignment is correct' },
  { id: 'pagination-nav-modals', label: 'Pagination/navigation/modals function correctly' },
  { id: 'clear-errors', label: 'Error messages are clear and user-friendly' },
]

const emptyBug = (): BugItem => ({
  title: '',
  stepsToReproduce: '',
  expectedResult: '',
  actualResult: '',
  environment: 'staging',
  reproducibleTwice: false,
  evidenceLinks: '',
  linearTicket: '',
  severity: 'medium',
})

const makeCheckGroup = (items: Omit<CheckItem, 'checked' | 'notes'>[]) =>
  items.map((item) => ({ ...item, checked: false, notes: '' }))

export default function QaTestingCreate(_props: QaTestingCreateProps) {
  const { data, setData, post, processing, errors } = useForm({
    reportName: '',
    linearTicket: '',
    featureScope: '',
    expectedBehavior: '',
    acceptanceCriteria: '',
    affectedEnvironments: [] as string[],
    environmentOrder: 'dev->staging->production',
    testAccount: '',
    permissionsConfirmed: false,
    testDataStatus: '',
    testDataNotes: '',
    functional: makeCheckGroup(functionalChecks),
    edgeCases: makeCheckGroup(edgeChecks),
    regression: makeCheckGroup(regressionChecks),
    crossEnvironment: makeCheckGroup(crossEnvChecks),
    uiUx: makeCheckGroup(uiChecks),
    bugs: [emptyBug()],
    followUpRetested: false,
    followUpResolved: false,
    followUpNotes: '',
    finalStatus: 'draft' as 'draft' | 'in_progress' | 'blocked' | 'passed' | 'failed',
    qaSummary: '',
  })

  const totalChecks =
    data.functional.length +
    data.edgeCases.length +
    data.regression.length +
    data.crossEnvironment.length +
    data.uiUx.length

  const checkedCount = useMemo(() => {
    const groups = [
      ...data.functional,
      ...data.edgeCases,
      ...data.regression,
      ...data.crossEnvironment,
      ...data.uiUx,
    ]
    return groups.filter((c) => c.checked).length
  }, [data])

  const passRate = totalChecks > 0 ? Math.round((checkedCount / totalChecks) * 100) : 0

  const toggleCheck = (groupKey: 'functional' | 'edgeCases' | 'regression' | 'crossEnvironment' | 'uiUx', index: number, checked: boolean) => {
    const next = [...data[groupKey]]
    next[index] = { ...next[index], checked }
    setData(groupKey, next)
  }

  const setCheckNote = (groupKey: 'functional' | 'edgeCases' | 'regression' | 'crossEnvironment' | 'uiUx', index: number, notes: string) => {
    const next = [...data[groupKey]]
    next[index] = { ...next[index], notes }
    setData(groupKey, next)
  }

  const addBug = () => setData('bugs', [...data.bugs, emptyBug()])

  const removeBug = (index: number) => {
    if (data.bugs.length === 1) return
    setData(
      'bugs',
      data.bugs.filter((_, i) => i !== index),
    )
  }

  const setBugField = <K extends keyof BugItem>(index: number, key: K, value: BugItem[K]) => {
    const next = [...data.bugs]
    next[index] = { ...next[index], [key]: value }
    setData('bugs', next)
  }

  const toggleAffectedEnv = (env: string, checked: boolean) => {
    const current = new Set(data.affectedEnvironments)
    if (checked) current.add(env)
    else current.delete(env)
    setData('affectedEnvironments', Array.from(current))
  }

  const SectionChecks = ({
    title,
    description,
    groupKey,
    items,
  }: {
    title: string
    description: string
    groupKey: 'functional' | 'edgeCases' | 'regression' | 'crossEnvironment' | 'uiUx'
    items: CheckItem[]
  }) => (
    <AppCard title={title} description={description}>
      <div className='space-y-3'>
        {items.map((item, idx) => (
          <div key={item.id} className='rounded-md border p-3'>
            <div className='flex items-center gap-3'>
              <Checkbox
                id={`${groupKey}-${item.id}`}
                checked={item.checked}
                onCheckedChange={(v) => toggleCheck(groupKey, idx, v === true)}
              />
              <Label htmlFor={`${groupKey}-${item.id}`} className='font-medium'>
                {item.label}
              </Label>
            </div>
            <div className='mt-2'>
              <Textarea
                value={item.notes ?? ''}
                onChange={(e) => setCheckNote(groupKey, idx, e.target.value)}
                rows={2}
                placeholder='Notes, observations, or evidence links'
              />
            </div>
          </div>
        ))}
      </div>
    </AppCard>
  )

  return (
    <DashboardLayout>
      <Head title='Create QA Report' />

      <div className='space-y-6'>
        <PageHeader
          backHref='/qa-testing'
          title='Create QA Report'
          description='Capture a complete test run for analysts and stakeholders.'
        />

        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant='secondary'>Checks: {checkedCount}/{totalChecks}</Badge>
          <Badge variant='outline'>Coverage: {passRate}%</Badge>
          <Badge variant='outline'>Bugs logged: {data.bugs.filter((b) => b.title.trim()).length}</Badge>
        </div>

        <form
          className='space-y-6'
          onSubmit={(e) => {
            e.preventDefault()
            post('/qa-testing', { preserveScroll: true })
          }}
        >
          <AppCard title='1. Understand the Scope' description='Feature/task context and expected behavior'>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField label='Report name' htmlFor='reportName' required error={errors.reportName}>
                <Input
                  id='reportName'
                  value={data.reportName}
                  onChange={(e) => setData('reportName', e.target.value)}
                  placeholder='e.g. Org invoice flow regression'
                  required
                />
              </FormField>

              <FormField label='Linear ticket' htmlFor='linearTicket' error={errors.linearTicket}>
                <Input
                  id='linearTicket'
                  value={data.linearTicket}
                  onChange={(e) => setData('linearTicket', e.target.value)}
                  placeholder='e.g. APP-123'
                />
              </FormField>

              <FormField label='Feature / scope description' htmlFor='featureScope' required error={errors.featureScope} className='md:col-span-2'>
                <Textarea
                  id='featureScope'
                  value={data.featureScope}
                  onChange={(e) => setData('featureScope', e.target.value)}
                  rows={3}
                  required
                />
              </FormField>

              <FormField label='Expected behavior' htmlFor='expectedBehavior' required error={errors.expectedBehavior} className='md:col-span-2'>
                <Textarea
                  id='expectedBehavior'
                  value={data.expectedBehavior}
                  onChange={(e) => setData('expectedBehavior', e.target.value)}
                  rows={3}
                  required
                />
              </FormField>

              <FormField label='Acceptance criteria' htmlFor='acceptanceCriteria' error={errors.acceptanceCriteria} className='md:col-span-2'>
                <Textarea
                  id='acceptanceCriteria'
                  value={data.acceptanceCriteria}
                  onChange={(e) => setData('acceptanceCriteria', e.target.value)}
                  rows={3}
                  placeholder='List acceptance points from ticket'
                />
              </FormField>
            </div>
          </AppCard>

          <AppCard title='2. Environment Setup' description='Environment order, accounts, permissions, and test data'>
            <div className='grid gap-4 md:grid-cols-2'>
              <FormField label='Test order' htmlFor='environmentOrder' error={errors.environmentOrder}>
                <Select value={data.environmentOrder} onValueChange={(v) => setData('environmentOrder', v)}>
                  <SelectTrigger id='environmentOrder'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='dev->staging->production'>Dev → Staging → Production</SelectItem>
                    <SelectItem value='dev->staging'>Dev → Staging</SelectItem>
                    <SelectItem value='staging->production'>Staging → Production</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label='Test account' htmlFor='testAccount' error={errors.testAccount}>
                <Input
                  id='testAccount'
                  value={data.testAccount}
                  onChange={(e) => setData('testAccount', e.target.value)}
                  placeholder='qa.analyst@company.com'
                />
              </FormField>

              <div className='md:col-span-2 space-y-2'>
                <Label>Affected environments</Label>
                <div className='flex flex-wrap gap-4'>
                  {['dev', 'staging', 'production'].map((env) => (
                    <div key={env} className='flex items-center gap-2'>
                      <Checkbox
                        id={`env-${env}`}
                        checked={data.affectedEnvironments.includes(env)}
                        onCheckedChange={(v) => toggleAffectedEnv(env, v === true)}
                      />
                      <Label htmlFor={`env-${env}`}>{env}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex items-center gap-2 md:col-span-2'>
                <Checkbox
                  id='permissionsConfirmed'
                  checked={data.permissionsConfirmed}
                  onCheckedChange={(v) => setData('permissionsConfirmed', v === true)}
                />
                <Label htmlFor='permissionsConfirmed'>Correct permissions confirmed</Label>
              </div>

              <FormField label='Test data status' htmlFor='testDataStatus' error={errors.testDataStatus}>
                <Select value={data.testDataStatus} onValueChange={(v) => setData('testDataStatus', v)}>
                  <SelectTrigger id='testDataStatus'>
                    <SelectValue placeholder='Select status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='existing-ready'>Existing data ready</SelectItem>
                    <SelectItem value='fresh-created'>Fresh data created</SelectItem>
                    <SelectItem value='blocked-missing'>Blocked: missing data</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label='Test data notes' htmlFor='testDataNotes' error={errors.testDataNotes}>
                <Textarea
                  id='testDataNotes'
                  value={data.testDataNotes}
                  onChange={(e) => setData('testDataNotes', e.target.value)}
                  rows={2}
                />
              </FormField>
            </div>
          </AppCard>

          <SectionChecks
            title='4. Functional Testing'
            description='Validate core workflow and expected behavior'
            groupKey='functional'
            items={data.functional}
          />

          <SectionChecks
            title='5. Edge Case Testing'
            description='Boundary and unusual behavior checks'
            groupKey='edgeCases'
            items={data.edgeCases}
          />

          <SectionChecks
            title='6. Regression Testing'
            description='Ensure related features and prior fixes remain stable'
            groupKey='regression'
            items={data.regression}
          />

          <SectionChecks
            title='7. Cross-Environment Verification'
            description='Confirm behavior consistency across target environments'
            groupKey='crossEnvironment'
            items={data.crossEnvironment}
          />

          <SectionChecks
            title='8. UI/UX Validation'
            description='Visual, navigation, and messaging quality checks'
            groupKey='uiUx'
            items={data.uiUx}
          />

          <AppCard title='9. Bug Documentation' description='Log reproducible defects with evidence and Linear details'>
            <div className='space-y-4'>
              {data.bugs.map((bug, idx) => (
                <div key={`bug-${idx}`} className='rounded-lg border p-4 space-y-3'>
                  <div className='flex items-center justify-between'>
                    <p className='font-medium'>Bug #{idx + 1}</p>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => removeBug(idx)}
                      disabled={data.bugs.length === 1}
                    >
                      <IconTrash className='mr-2 h-4 w-4' />
                      Remove
                    </Button>
                  </div>

                  <div className='grid gap-4 md:grid-cols-2'>
                    <FormField label='Title' htmlFor={`bug-title-${idx}`}>
                      <Input
                        id={`bug-title-${idx}`}
                        value={bug.title}
                        onChange={(e) => setBugField(idx, 'title', e.target.value)}
                        placeholder='Short, clear bug title'
                      />
                    </FormField>

                    <FormField label='Linear ticket' htmlFor={`bug-linear-${idx}`}>
                      <Input
                        id={`bug-linear-${idx}`}
                        value={bug.linearTicket}
                        onChange={(e) => setBugField(idx, 'linearTicket', e.target.value)}
                        placeholder='e.g. APP-456'
                      />
                    </FormField>

                    <FormField label='Expected result' htmlFor={`bug-expected-${idx}`} className='md:col-span-2'>
                      <Textarea
                        id={`bug-expected-${idx}`}
                        value={bug.expectedResult}
                        onChange={(e) => setBugField(idx, 'expectedResult', e.target.value)}
                        rows={2}
                      />
                    </FormField>

                    <FormField label='Actual result' htmlFor={`bug-actual-${idx}`} className='md:col-span-2'>
                      <Textarea
                        id={`bug-actual-${idx}`}
                        value={bug.actualResult}
                        onChange={(e) => setBugField(idx, 'actualResult', e.target.value)}
                        rows={2}
                      />
                    </FormField>

                    <FormField label='Steps to reproduce' htmlFor={`bug-steps-${idx}`} className='md:col-span-2'>
                      <Textarea
                        id={`bug-steps-${idx}`}
                        value={bug.stepsToReproduce}
                        onChange={(e) => setBugField(idx, 'stepsToReproduce', e.target.value)}
                        rows={3}
                        placeholder='1. ... 2. ... 3. ...'
                      />
                    </FormField>

                    <FormField label='Environment' htmlFor={`bug-env-${idx}`}>
                      <Select value={bug.environment} onValueChange={(v) => setBugField(idx, 'environment', v as BugItem['environment'])}>
                        <SelectTrigger id={`bug-env-${idx}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='dev'>Dev</SelectItem>
                          <SelectItem value='staging'>Staging</SelectItem>
                          <SelectItem value='production'>Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label='Severity' htmlFor={`bug-severity-${idx}`}>
                      <Select value={bug.severity} onValueChange={(v) => setBugField(idx, 'severity', v as BugItem['severity'])}>
                        <SelectTrigger id={`bug-severity-${idx}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='low'>Low</SelectItem>
                          <SelectItem value='medium'>Medium</SelectItem>
                          <SelectItem value='high'>High</SelectItem>
                          <SelectItem value='critical'>Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label='Evidence links (screenshots/video)' htmlFor={`bug-evidence-${idx}`} className='md:col-span-2'>
                      <Input
                        id={`bug-evidence-${idx}`}
                        value={bug.evidenceLinks}
                        onChange={(e) => setBugField(idx, 'evidenceLinks', e.target.value)}
                        placeholder='Comma-separated URLs'
                      />
                    </FormField>

                    <div className='md:col-span-2 flex items-center gap-2'>
                      <Checkbox
                        id={`bug-repro-${idx}`}
                        checked={bug.reproducibleTwice}
                        onCheckedChange={(v) => setBugField(idx, 'reproducibleTwice', v === true)}
                      />
                      <Label htmlFor={`bug-repro-${idx}`}>Issue reproduced at least twice</Label>
                    </div>
                  </div>
                </div>
              ))}

              <Button type='button' variant='outline' onClick={addBug}>
                <IconPlus className='mr-2 h-4 w-4' />
                Add bug
              </Button>
            </div>
          </AppCard>

          <AppCard title='10. Follow-Up Testing' description='Retest after fixes and close the loop'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='flex items-center gap-2'>
                <Checkbox
                  id='followUpRetested'
                  checked={data.followUpRetested}
                  onCheckedChange={(v) => setData('followUpRetested', v === true)}
                />
                <Label htmlFor='followUpRetested'>Fix retested after deployment</Label>
              </div>

              <div className='flex items-center gap-2'>
                <Checkbox
                  id='followUpResolved'
                  checked={data.followUpResolved}
                  onCheckedChange={(v) => setData('followUpResolved', v === true)}
                />
                <Label htmlFor='followUpResolved'>Issue fully resolved</Label>
              </div>

              <FormField label='Final status' htmlFor='finalStatus' error={errors.finalStatus}>
                <Select
                  value={data.finalStatus}
                  onValueChange={(v) => setData('finalStatus', v as typeof data.finalStatus)}
                >
                  <SelectTrigger id='finalStatus'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='draft'>Draft</SelectItem>
                    <SelectItem value='in_progress'>In Progress</SelectItem>
                    <SelectItem value='blocked'>Blocked</SelectItem>
                    <SelectItem value='passed'>Passed</SelectItem>
                    <SelectItem value='failed'>Failed</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label='QA summary' htmlFor='qaSummary' error={errors.qaSummary} className='md:col-span-2'>
                <Textarea
                  id='qaSummary'
                  value={data.qaSummary}
                  onChange={(e) => setData('qaSummary', e.target.value)}
                  rows={4}
                  placeholder='Overall findings, risks, and recommendation'
                />
              </FormField>

              <FormField label='Verification notes' htmlFor='followUpNotes' error={errors.followUpNotes} className='md:col-span-2'>
                <Textarea
                  id='followUpNotes'
                  value={data.followUpNotes}
                  onChange={(e) => setData('followUpNotes', e.target.value)}
                  rows={3}
                />
              </FormField>
            </div>
          </AppCard>

          <div className='flex flex-wrap gap-2'>
            <Button type='submit' disabled={processing} isLoading={processing} loadingText='Saving...'>
              Save QA report
            </Button>
            <Button type='button' variant='outline' asChild>
              <Link href='/qa-testing'>Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
