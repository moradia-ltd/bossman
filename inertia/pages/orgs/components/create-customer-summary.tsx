import type { FormikProps } from 'formik'
import { startCase } from '#utils/functions'
import { OnlyShowIf, SimpleGrid } from '@/components/ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { CreateCustomerFormValues } from '../create-form'

interface CreateCustomerSummaryProps {
  formik: FormikProps<CreateCustomerFormValues>
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className='text-sm font-medium text-muted-foreground'>{label}</dt>
      <dd className='mt-0.5'>{value ?? '—'}</dd>
    </div>
  )
}

export function CreateCustomerSummary({ formik }: CreateCustomerSummaryProps) {
  const { values } = formik
  const ps = values.customPaymentSchedule
  const fl = values.featureList
  const lp = values.languagePreferences
  const isCustom = ps.planType === 'custom'

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
          <CardDescription>Contact and address</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className='grid gap-4 sm:grid-cols-2'>
            <SummaryRow label='Type' value={startCase(values.accountType)} />
            <SummaryRow label='Name' value={values.name} />
            <SummaryRow label='Email' value={values.email} />
            <SummaryRow label='Contact number' value={values.contactNumber} />
            <SummaryRow label='Country' value={values.country} />
            <SummaryRow
              label='Address'
              value={[values.addressLineOne, values.addressLineTwo, values.city, values.postCode]
                .filter(Boolean)
                .join(', ')}
            />
            <SummaryRow label='White label' value={values.isWhiteLabelEnabled ? 'Yes' : 'No'} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment & plan</CardTitle>
          <CardDescription>Subscription and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className='grid gap-4 sm:grid-cols-2'>
            <SummaryRow label='Plan type' value={startCase(ps.planType)} />
            <OnlyShowIf condition={!isCustom}>
              <SummaryRow label='Plan' value={startCase(ps.plan)} />
            </OnlyShowIf>
            <SummaryRow label='Frequency' value={startCase(ps.frequency)} />
            <OnlyShowIf condition={isCustom}>
              <SummaryRow label='Amount' value={`${ps.currency.toUpperCase()} ${ps.amount}`} />
              <SummaryRow
                label='Trial period'
                value={ps.trialPeriodInDays > 0 ? `${ps.trialPeriodInDays} days` : 'None'}
              />
              <SummaryRow label='Promo code' value={ps.promoCode || 'None'} />
            </OnlyShowIf>
            <SummaryRow
              label='Payment method'
              value={ps.paymentMethod === 'bank_transfer' ? 'Bank transfer' : 'Stripe'}
            />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Features & limits</CardTitle>
          <CardDescription>Property, tenant, and feature limits</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleGrid cols={4}>
            <SummaryRow label='Property limit' value={fl.propertyLimit} />
            <SummaryRow label='Tenant limit' value={fl.tenantLimit} />
            <SummaryRow label='Team size limit' value={fl.teamSizeLimit} />
            <SummaryRow label='Storage limit (GB)' value={fl.storageLimit} />
            <SummaryRow label='Activity log retention (days)' value={fl.activityLogRetention} />
            <SummaryRow label='e-Sign limit (per month)' value={fl.eSignDocsLimit} />
            <SummaryRow label='AI messages limit (per month)' value={fl.aiInvocationLimit} />
            <SummaryRow label='Custom templates limit' value={fl.customTemplatesLimit} />
            <SummaryRow label='Priority support' value={fl.prioritySupport ? 'Yes' : 'No'} />
            <SummaryRow label='Deposit protection' value={fl.depositProtection ? 'Yes' : 'No'} />
            <SummaryRow label='Advanced reporting' value={fl.advancedReporting ? 'Yes' : 'No'} />
          </SimpleGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pages</CardTitle>
          <CardDescription>Enabled sections for this customer</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='space-y-2'>
            {values.pages.orgPages.map((page) => (
              <li
                key={page.label}
                className='flex items-center justify-between rounded-md border px-3 py-2 text-sm'>
                <span className='font-medium'>{page.label}</span>
                <span className='text-muted-foreground'>
                  {page.isEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Language preferences</CardTitle>
          <CardDescription>Terminology labels</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className='grid gap-4 sm:grid-cols-3'>
            <SummaryRow label='Tenants' value={lp.tenants} />
            <SummaryRow label='Properties' value={lp.properties} />
            <SummaryRow label='Tenancies' value={lp.tenancies} />
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
