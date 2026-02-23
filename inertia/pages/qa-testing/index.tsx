import type { SharedProps } from '@adonisjs/inertia/types'
import { Head, Link } from '@inertiajs/react'
import {
  IconAlertTriangle,
  IconBug,
  IconCircleCheck,
  IconDownload,
  IconFileText,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/layout'
import { PageHeader } from '@/components/dashboard/page_header'
import { AppCard } from '@/components/ui/app-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/form_field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/seperator'
import { Textarea } from '@/components/ui/textarea'

interface QaTestingIndexProps extends SharedProps {}

type CheckStatus = 'pass' | 'fail' | 'na'

type ChecklistItem = {
  id: string
  label: string
  category: string
  status: CheckStatus
  notes: string
}

type BugEntry = {
  id: string
  title: string
  stepsToReproduce: string
  expectedResult: string
  actualResult: string
  environment: string
  evidence: string
  reproducedTwice: boolean
}

const createChecklist = (): ChecklistItem[] => [
  {
    id: 'scope_linear',
    category: '1. Scope & Requirements',
    label: 'Reviewed feature/task/bug ticket in Linear',
    status: 'na',
    notes: '',
  },
  {
    id: 'scope_acceptance',
    category: '1. Scope & Requirements',
    label: 'Clarified expected behavior and acceptance criteria',
    status: 'na',
    notes: '',
  },
  {
    id: 'scope_env',
    category: '1. Scope & Requirements',
    label: 'Identified affected environments',
    status: 'na',
    notes: '',
  },

  {
    id: 'env_dev',
    category: '2. Environment Setup',
    label: 'Logged into dev environment',
    status: 'na',
    notes: '',
  },
  {
    id: 'env_staging',
    category: '2. Environment Setup',
    label: 'Logged into staging environment',
    status: 'na',
    notes: '',
  },
  {
    id: 'env_prod',
    category: '2. Environment Setup',
    label: 'Logged into production environment',
    status: 'na',
    notes: '',
  },
  {
    id: 'env_permissions',
    category: '2. Environment Setup',
    label: 'Confirmed test account and permissions',
    status: 'na',
    notes: '',
  },
  {
    id: 'env_data',
    category: '2. Environment Setup',
    label: 'Prepared/created fresh test data',
    status: 'na',
    notes: '',
  },

  {
    id: 'functional_inputs',
    category: '3. Functional Testing',
    label: 'Validated required/optional input fields and errors',
    status: 'na',
    notes: '',
  },
  {
    id: 'functional_buttons',
    category: '3. Functional Testing',
    label: 'Validated button actions',
    status: 'na',
    notes: '',
  },
  {
    id: 'functional_persistence',
    category: '3. Functional Testing',
    label: 'Validated data saving and persistence',
    status: 'na',
    notes: '',
  },
  {
    id: 'functional_redirect',
    category: '3. Functional Testing',
    label: 'Validated redirections',
    status: 'na',
    notes: '',
  },
  {
    id: 'functional_output',
    category: '3. Functional Testing',
    label: 'Confirmed output matches expected behavior',
    status: 'na',
    notes: '',
  },

  {
    id: 'edge_boundary',
    category: '4. Edge Cases',
    label: 'Tested boundary conditions (empty/large/invalid)',
    status: 'na',
    notes: '',
  },
  {
    id: 'edge_roles',
    category: '4. Edge Cases',
    label: 'Tested different user roles',
    status: 'na',
    notes: '',
  },
  {
    id: 'edge_unusual',
    category: '4. Edge Cases',
    label: 'Tested unusual but possible user behavior',
    status: 'na',
    notes: '',
  },

  {
    id: 'regression_related',
    category: '5. Regression',
    label: 'Retested related features',
    status: 'na',
    notes: '',
  },
  {
    id: 'regression_fixed',
    category: '5. Regression',
    label: 'Rechecked previously fixed bugs',
    status: 'na',
    notes: '',
  },

  {
    id: 'cross_staging',
    category: '6. Cross-Platform/Env',
    label: 'Verified behavior on staging',
    status: 'na',
    notes: '',
  },
  {
    id: 'cross_production',
    category: '6. Cross-Platform/Env',
    label: 'Verified behavior on production',
    status: 'na',
    notes: '',
  },
  {
    id: 'cross_browsers',
    category: '6. Cross-Platform/Env',
    label: 'Verified behavior on required browsers',
    status: 'na',
    notes: '',
  },

  {
    id: 'ui_alignment',
    category: '7. UI/UX',
    label: 'Checked layout alignment',
    status: 'na',
    notes: '',
  },
  {
    id: 'ui_navigation',
    category: '7. UI/UX',
    label: 'Checked pagination/navigation/modals',
    status: 'na',
    notes: '',
  },
  {
    id: 'ui_errors',
    category: '7. UI/UX',
    label: 'Checked error messages for clarity',
    status: 'na',
    notes: '',
  },

  {
    id: 'bug_reproduce',
    category: '8. Defect Management',
    label: 'Reproduced bug at least twice (if any)',
    status: 'na',
    notes: '',
  },
  {
    id: 'bug_evidence',
    category: '8. Defect Management',
    label: 'Captured screenshots/screen recordings',
    status: 'na',
    notes: '',
  },
  {
    id: 'bug_logged',
    category: '8. Defect Management',
    label: 'Logged bug in Linear with full details',
    status: 'na',
    notes: '',
  },

  {
    id: 'followup_retest',
    category: '9. Follow-Up',
    label: 'Retested after fix deployment',
    status: 'na',
    notes: '',
  },
  {
    id: 'followup_verified',
    category: '9. Follow-Up',
    label: 'Marked ticket verified / commented with results',
    status: 'na',
    notes: '',
  },
]

function statusButtonClass(current: CheckStatus, target: CheckStatus) {
  const base = 'h-8 px-3 text-xs font-medium transition-all'
  if (current === target) {
    if (target === 'pass')
      return `${base} bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600`
    if (target === 'fail') return `${base} bg-red-600 hover:bg-red-700 text-white border-red-600`
    return `${base} bg-slate-600 hover:bg-slate-700 text-white border-slate-600`
  }
  return `${base} bg-background hover:bg-accent text-muted-foreground border border-input`
}

export default function QaTestingIndex(_props: QaTestingIndexProps) {
  const [featureName, setFeatureName] = useState('')
  const [linearTicket, setLinearTicket] = useState('')
  const [testerName, setTesterName] = useState('')
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10))
  const [overallNotes, setOverallNotes] = useState('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>(createChecklist())
  const [bugs, setBugs] = useState<BugEntry[]>([])

  const summary = useMemo(() => {
    const passed = checklist.filter((x) => x.status === 'pass').length
    const failed = checklist.filter((x) => x.status === 'fail').length
    const na = checklist.filter((x) => x.status === 'na').length
    const total = checklist.length
    const completion = Math.round(((passed + failed + na) / total) * 100) // Count N/A as processed
    const verdict =
      failed > 0
        ? 'Failed'
        : passed > 0 && passed + na === total
          ? 'Passed'
          : passed === total
            ? 'Passed'
            : 'In Progress'
    return { passed, failed, na, total, completion, verdict }
  }, [checklist])

  // Group checklist items by category
  const groupedChecklist = useMemo(() => {
    const groups: Record<string, ChecklistItem[]> = {}
    checklist.forEach((item) => {
      if (!groups[item.category]) groups[item.category] = []
      groups[item.category].push(item)
    })
    return groups
  }, [checklist])

  const setStatus = (id: string, status: CheckStatus) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)))
  }

  const setItemNotes = (id: string, notes: string) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, notes } : item)))
  }

  const addBug = () => {
    setBugs((prev) => [
      ...prev,
      {
        id: `bug-${Date.now()}-${prev.length}`,
        title: '',
        stepsToReproduce: '',
        expectedResult: '',
        actualResult: '',
        environment: '',
        evidence: '',
        reproducedTwice: false,
      },
    ])
  }

  const removeBug = (id: string) => {
    setBugs((prev) => prev.filter((bug) => bug.id !== id))
  }

  const updateBug = <K extends keyof BugEntry>(id: string, key: K, value: BugEntry[K]) => {
    setBugs((prev) => prev.map((bug) => (bug.id === id ? { ...bug, [key]: value } : bug)))
  }

  const exportMarkdown = () => {
    const lines: string[] = []
    lines.push(`# QA Test Report`)
    lines.push(``)
    lines.push(`- **Feature/Task:** ${featureName || '-'}`)
    lines.push(`- **Linear Ticket:** ${linearTicket || '-'}`)
    lines.push(`- **Tester:** ${testerName || '-'}`)
    lines.push(`- **Date:** ${testDate || '-'}`)
    lines.push(`- **Verdict:** ${summary.verdict}`)
    lines.push(`- **Completion:** ${summary.completion}%`)
    lines.push(``)
    lines.push(`## Checklist`)

    // Grouped export
    Object.entries(groupedChecklist).forEach(([category, items]) => {
      lines.push(`### ${category}`)
      items.forEach((item) => {
        const icon = item.status === 'pass' ? '✅' : item.status === 'fail' ? '❌' : '➖'
        lines.push(`- ${icon} ${item.label}${item.notes ? ` — ${item.notes}` : ''}`)
      })
      lines.push(``)
    })

    lines.push(``)
    lines.push(`## Bugs`)
    if (bugs.length === 0) {
      lines.push(`- No bugs logged.`)
    } else {
      bugs.forEach((bug, idx) => {
        lines.push(`### ${idx + 1}. ${bug.title || 'Untitled bug'}`)
        lines.push(`- Steps to reproduce: ${bug.stepsToReproduce || '-'}`)
        lines.push(`- Expected result: ${bug.expectedResult || '-'}`)
        lines.push(`- Actual result: ${bug.actualResult || '-'}`)
        lines.push(`- Environment: ${bug.environment || '-'}`)
        lines.push(`- Evidence: ${bug.evidence || '-'}`)
        lines.push(`- Reproduced twice: ${bug.reproducedTwice ? 'Yes' : 'No'}`)
        lines.push(``)
      })
    }
    lines.push(`## Overall Notes`)
    lines.push(overallNotes || '-')

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `qa-test-report-${(linearTicket || featureName || 'draft')
      .replace(/\s+/g, '-')
      .toLowerCase()}.md`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <Head title='QA Testing' />
      <div className='space-y-8 max-w-5xl mx-auto pb-10'>
        <PageHeader
          title='QA Testing'
          description='Interactive checklist for manual QA testing. Run your workflow and export a report.'
        />

        {/* Summary Card - Sticky on larger screens? Maybe just prominent at top */}
        <div className='grid gap-6 md:grid-cols-3'>
          <div className='md:col-span-2 space-y-6'>
            <AppCard title='Report Metadata'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField label='Feature / Task' htmlFor='featureName'>
                  <Input
                    id='featureName'
                    value={featureName}
                    onChange={(e) => setFeatureName(e.target.value)}
                    placeholder='e.g. Invoice line item flow'
                  />
                </FormField>
                <FormField label='Linear Ticket' htmlFor='linearTicket'>
                  <Input
                    id='linearTicket'
                    value={linearTicket}
                    onChange={(e) => setLinearTicket(e.target.value)}
                    placeholder='e.g. BM-1234'
                  />
                </FormField>
                <FormField label='Tester Name' htmlFor='testerName'>
                  <Input
                    id='testerName'
                    value={testerName}
                    onChange={(e) => setTesterName(e.target.value)}
                    placeholder='Your name'
                  />
                </FormField>
                <FormField label='Test Date' htmlFor='testDate'>
                  <Input
                    id='testDate'
                    type='date'
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                  />
                </FormField>
              </div>
            </AppCard>

            {/* Render Checklist Groups */}
            {Object.entries(groupedChecklist).map(([category, items]) => (
              <AppCard key={category} title={category}>
                <div className='space-y-1'>
                  {items.map((item, index) => (
                    <div key={item.id}>
                      {index > 0 && <Separator className='my-3 opacity-50' />}
                      <div className='group'>
                        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                          <div className='flex-1 pt-1'>
                            <Label
                              className={`text-base font-normal ${item.status === 'na' ? 'text-muted-foreground' : ''}`}
                              htmlFor={`notes-${item.id}`}>
                              {item.label}
                            </Label>
                          </div>
                          <div className='flex items-center gap-1 bg-muted/30 p-1 rounded-md shrink-0'>
                            <button
                              type='button'
                              onClick={() => setStatus(item.id, 'pass')}
                              className={statusButtonClass(item.status, 'pass')}
                              title='Pass'>
                              Pass
                            </button>
                            <button
                              type='button'
                              onClick={() => setStatus(item.id, 'fail')}
                              className={statusButtonClass(item.status, 'fail')}
                              title='Fail'>
                              Fail
                            </button>
                            <button
                              type='button'
                              onClick={() => setStatus(item.id, 'na')}
                              className={statusButtonClass(item.status, 'na')}
                              title='N/A'>
                              N/A
                            </button>
                          </div>
                        </div>

                        {/* Notes area - always visible if has content, or on focus/hover logic if we wanted to get fancy. Keeping it simple. */}
                        <div className='mt-2 pl-0 sm:pl-0'>
                          <Input
                            id={`notes-${item.id}`}
                            value={item.notes}
                            onChange={(e) => setItemNotes(item.id, e.target.value)}
                            className='h-8 text-sm bg-muted/20 border-transparent focus:border-input focus:bg-background transition-all placeholder:text-muted-foreground/50'
                            placeholder='Add notes...'
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </AppCard>
            ))}

            <AppCard
              title={
                <div className='flex items-center gap-2'>
                  <IconBug className='h-5 w-5 text-red-500' />
                  <span>Defect Management</span>
                </div>
              }
              description='Log any bugs found during testing.'>
              <div className='space-y-6'>
                {bugs.length === 0 ? (
                  <div className='flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in zoom-in-95 duration-300'>
                    <IconCircleCheck className='h-10 w-10 text-muted-foreground/50 mb-3' />
                    <p className='text-sm font-medium text-muted-foreground'>No bugs logged yet</p>
                    <p className='text-xs text-muted-foreground/70 mb-4'>
                      Great job! Or maybe look harder? 😉
                    </p>
                    <Button type='button' variant='outline' size='sm' onClick={addBug}>
                      <IconPlus className='mr-2 h-4 w-4' />
                      Log a Bug
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {bugs.map((bug, index) => (
                      <div
                        key={bug.id}
                        className='relative rounded-lg border bg-card text-card-foreground shadow-sm p-5 space-y-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <Badge variant='destructive' className='h-6'>
                              Bug #{index + 1}
                            </Badge>
                          </div>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='text-muted-foreground hover:text-destructive'
                            onClick={() => removeBug(bug.id)}>
                            <IconTrash className='h-4 w-4' />
                          </Button>
                        </div>

                        <FormField label='Title' htmlFor={`bug-title-${bug.id}`}>
                          <Input
                            id={`bug-title-${bug.id}`}
                            value={bug.title}
                            onChange={(e) => updateBug(bug.id, 'title', e.target.value)}
                            placeholder='Brief description of the issue'
                            className='font-medium'
                          />
                        </FormField>

                        <div className='grid gap-4 md:grid-cols-2'>
                          <FormField label='Expected Result' htmlFor={`bug-expected-${bug.id}`}>
                            <Textarea
                              id={`bug-expected-${bug.id}`}
                              value={bug.expectedResult}
                              onChange={(e) => updateBug(bug.id, 'expectedResult', e.target.value)}
                              rows={2}
                              className='resize-none'
                            />
                          </FormField>

                          <FormField label='Actual Result' htmlFor={`bug-actual-${bug.id}`}>
                            <Textarea
                              id={`bug-actual-${bug.id}`}
                              value={bug.actualResult}
                              onChange={(e) => updateBug(bug.id, 'actualResult', e.target.value)}
                              rows={2}
                              className='resize-none'
                            />
                          </FormField>
                        </div>

                        <FormField label='Steps to Reproduce' htmlFor={`bug-steps-${bug.id}`}>
                          <Textarea
                            id={`bug-steps-${bug.id}`}
                            value={bug.stepsToReproduce}
                            onChange={(e) => updateBug(bug.id, 'stepsToReproduce', e.target.value)}
                            rows={3}
                          />
                        </FormField>

                        <div className='grid gap-4 md:grid-cols-2'>
                          <FormField label='Environment' htmlFor={`bug-env-${bug.id}`}>
                            <Input
                              id={`bug-env-${bug.id}`}
                              value={bug.environment}
                              onChange={(e) => updateBug(bug.id, 'environment', e.target.value)}
                              placeholder='e.g. Staging / Chrome'
                            />
                          </FormField>
                          <FormField label='Evidence Link' htmlFor={`bug-evidence-${bug.id}`}>
                            <Input
                              id={`bug-evidence-${bug.id}`}
                              value={bug.evidence}
                              onChange={(e) => updateBug(bug.id, 'evidence', e.target.value)}
                              placeholder='URL to screenshot/video'
                            />
                          </FormField>
                        </div>

                        <div className='flex items-center gap-2'>
                          <input
                            id={`bug-reproduced-${bug.id}`}
                            type='checkbox'
                            className='h-4 w-4 rounded border-primary text-primary focus:ring-primary'
                            checked={bug.reproducedTwice}
                            onChange={(e) => updateBug(bug.id, 'reproducedTwice', e.target.checked)}
                          />
                          <Label htmlFor={`bug-reproduced-${bug.id}`} className='cursor-pointer'>
                            I have reproduced this issue at least twice
                          </Label>
                        </div>
                      </div>
                    ))}
                    <Button type='button' variant='outline' className='w-full' onClick={addBug}>
                      <IconPlus className='mr-2 h-4 w-4' />
                      Add Another Bug
                    </Button>
                  </div>
                )}
              </div>
            </AppCard>

            <AppCard title='Final Analysis'>
              <FormField label='Overall Notes & Recommendation' htmlFor='overallNotes'>
                <Textarea
                  id='overallNotes'
                  value={overallNotes}
                  onChange={(e) => setOverallNotes(e.target.value)}
                  rows={4}
                  placeholder='Summarize your findings. is this ready for production?'
                />
              </FormField>
            </AppCard>
          </div>

          {/* Sidebar Summary */}
          <div className='md:col-span-1'>
            <div className='sticky top-6 space-y-6'>
              <AppCard title='Test Summary' className='border-t-4 border-t-primary'>
                <div className='space-y-6'>
                  <div className='flex flex-col items-center justify-center py-2'>
                    <div
                      className={`text-3xl font-bold ${
                        summary.verdict === 'Failed'
                          ? 'text-red-600'
                          : summary.verdict.includes('Passed')
                            ? 'text-emerald-600'
                            : 'text-primary'
                      }`}>
                      {summary.completion}%
                    </div>
                    <div className='text-sm text-muted-foreground'>Complete</div>
                  </div>

                  <Separator />

                  <div className='space-y-3 text-sm'>
                    <div className='flex justify-between items-center'>
                      <span className='flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full bg-emerald-500' />
                        Passed
                      </span>
                      <span className='font-medium'>{summary.passed}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full bg-red-500' />
                        Failed
                      </span>
                      <span className='font-medium'>{summary.failed}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='flex items-center gap-2'>
                        <div className='h-2 w-2 rounded-full bg-slate-400' />
                        N/A
                      </span>
                      <span className='font-medium'>{summary.na}</span>
                    </div>
                    <div className='flex justify-between items-center pt-2 border-t'>
                      <span className='font-semibold'>Verdict</span>
                      <Badge
                        variant={
                          summary.verdict === 'Failed'
                            ? 'destructive'
                            : summary.verdict.includes('Passed')
                              ? 'outline'
                              : 'secondary'
                        }
                        className={
                          summary.verdict.includes('Passed')
                            ? 'text-emerald-600 border-emerald-600'
                            : ''
                        }>
                        {summary.verdict}
                      </Badge>
                    </div>
                  </div>

                  {summary.failed > 0 && (
                    <div className='bg-red-50 text-red-700 p-3 rounded-md text-xs flex gap-2'>
                      <IconAlertTriangle className='h-4 w-4 shrink-0' />
                      <span>There are failing checks. Review them before exporting.</span>
                    </div>
                  )}

                  <Button onClick={exportMarkdown} className='w-full gap-2' size='lg'>
                    <IconDownload className='h-4 w-4' />
                    Export Report
                  </Button>

                  <Button variant='outline' asChild className='w-full gap-2'>
                    <Link href='/qa-testing/create'>
                      <IconFileText className='h-4 w-4' />
                      Go to Database View
                    </Link>
                  </Button>
                </div>
              </AppCard>

              <div className='rounded-lg border bg-card p-4 text-xs text-muted-foreground'>
                <h4 className='font-semibold mb-2 text-foreground'>Tips</h4>
                <ul className='list-disc list-inside space-y-1'>
                  <li>Check console for hidden errors</li>
                  <li>Test on mobile viewports</li>
                  <li>Verify network request timing</li>
                  <li>Take screenshots for all bugs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
