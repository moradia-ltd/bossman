import type { FormikProps } from 'formik'

import { startCase } from '#utils/functions'
import DetailRow from '@/components/dashboard/detail-row'
import { OnlyShowIf, SimpleGrid } from '@/components/ui'
import { AppCard } from '@/components/ui/app-card'
import { cn } from '@/lib/utils'

import type { CreateCustomerFormValues } from '../create-form'

interface CreateCustomerSummaryProps {
  formik: FormikProps<CreateCustomerFormValues>
}

export function CreateCustomerSummary({ formik }: CreateCustomerSummaryProps) {
  const { values } = formik
  const ps = values.customPaymentSchedule
  const fl = values.featureList
  const lp = values.languagePreferences
  const isCustom = ps.planType === 'custom'

  return (
    <div className='space-y-6'>
      <AppCard title='Account details' description='Contact and address'>
        <SimpleGrid cols={4}>
          <DetailRow label='Type' value={startCase(values.accountType)} />
          <DetailRow label='Name' value={values.name} />
          <DetailRow label='Email' value={values.email} />
          <DetailRow label='Contact number' value={values.contactNumber} />
          <DetailRow label='Country' value={values.country} />
          <DetailRow
            label='Address'
            value={[values.addressLineOne, values.addressLineTwo, values.city, values.postCode]
              .filter(Boolean)
              .join(', ')}
          />
          <DetailRow label='White label' value={values.isWhiteLabelEnabled ? 'Yes' : 'No'} />
        </SimpleGrid>
      </AppCard>

      <AppCard title='Payment & plan' description='Subscription and billing'>
        <SimpleGrid cols={3}>
          <DetailRow label='Plan type' value={startCase(ps.planType)} />
          <OnlyShowIf condition={!isCustom}>
            <DetailRow label='Plan' value={startCase(ps.plan)} />
          </OnlyShowIf>
          <DetailRow label='Frequency' value={startCase(ps.frequency)} />
          <OnlyShowIf condition={isCustom}>
            <DetailRow label='Amount' value={`${ps.currency.toUpperCase()} ${ps.amount}`} />
            <DetailRow
              label='Trial period'
              value={ps.trialPeriodInDays > 0 ? `${ps.trialPeriodInDays} days` : 'None'}
            />
            <DetailRow label='Promo code' value={ps.promoCode || 'None'} />
          </OnlyShowIf>
          <DetailRow
            label='Payment method'
            value={ps.paymentMethod === 'bank_transfer' ? 'Bank transfer' : 'Stripe'}
          />
        </SimpleGrid>
      </AppCard>

      <AppCard title='Features & limits' description='Property, tenant, and feature limits'>
        <SimpleGrid cols={4}>
          <DetailRow label='Property limit' value={fl.propertyLimit} />
          <DetailRow label='Tenant limit' value={fl.tenantLimit} />
          <DetailRow label='Team size limit' value={fl.teamSizeLimit} />
          <DetailRow label='Storage limit (GB)' value={fl.storageLimit} />
          <DetailRow label='Activity log retention (days)' value={fl.activityLogRetention} />
          <DetailRow label='e-Sign limit (per month)' value={fl.eSignDocsLimit} />
          <DetailRow label='AI messages limit (per month)' value={fl.aiInvocationLimit} />
          <DetailRow label='Custom templates limit' value={fl.customTemplatesLimit} />
          <DetailRow label='Priority support' value={fl.prioritySupport ? 'Yes' : 'No'} />
          <DetailRow label='Deposit protection' value={fl.depositProtection ? 'Yes' : 'No'} />
          <DetailRow label='Advanced reporting' value={fl.advancedReporting ? 'Yes' : 'No'} />
        </SimpleGrid>
      </AppCard>

      <AppCard title='Pages' description='Enabled sections for this customer'>
        <SimpleGrid cols={3}>
          {values.pages.orgPages.map((page) => (
            <li
              key={page.label}
              className='flex items-center justify-between rounded-md border px-3 py-2 text-sm'>
              <span className='font-medium'>{page.label}</span>
              <span className={cn(page.isEnabled ? 'text-green-500' : 'text-red-500')}>
                {page.isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </li>
          ))}
        </SimpleGrid>
      </AppCard>

      <AppCard title='Language preferences' description='Terminology labels'>
        <SimpleGrid cols={3}>
          <DetailRow label='Tenants' value={lp.tenants} />
          <DetailRow label='Properties' value={lp.properties} />
          <DetailRow label='Tenancies' value={lp.tenancies} />
        </SimpleGrid>
      </AppCard>
    </div>
  )
}
