export type AddonBillingType = 'one_off' | 'recurring_monthly' | 'recurring_yearly' | 'usage'

export const BILLING_LABELS: Record<AddonBillingType, string> = {
  one_off: 'One-off',
  recurring_monthly: 'Monthly',
  recurring_yearly: 'Yearly',
  usage: 'Usage',
}
