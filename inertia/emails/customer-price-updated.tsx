import { EmailButton, EmailHeading, EmailLink, EmailText, EmailWrapper } from '#emails/layout'
import type { Emails } from '#types/mails'

function formatPrice(amount: number, currency: string): string {
  const code = currency.toUpperCase()
  if (code === 'GBP') return `£${amount.toFixed(2)}`
  if (code === 'USD') return `$${amount.toFixed(2)}`
  if (code === 'EUR') return `€${amount.toFixed(2)}`
  return `${amount.toFixed(2)} ${code}`
}

function CustomerPriceUpdated(props: Emails['customer-price-updated']) {
  const displayPrice = formatPrice(props.amount, props.currency)
  return (
    <EmailWrapper>
      <EmailHeading>Your subscription price has been updated</EmailHeading>
      <EmailText>Hi {props.fullName || 'there'},</EmailText>
      <EmailText>
        Your subscription price has been updated to <strong>{displayPrice}</strong> per tenant.
      </EmailText>
      <EmailText>
        Click the link below to review and confirm the new price in our secure checkout.
      </EmailText>
      <EmailButton href={props.url}>Review new price</EmailButton>
      <EmailText>
        If the button doesn&apos;t work, copy and paste this link into your browser:
      </EmailText>
      <EmailLink href={props.url}>{props.url}</EmailLink>
      <EmailText>This link will expire after a short time. If you need a new link, contact support.</EmailText>
    </EmailWrapper>
  )
}

export default CustomerPriceUpdated
