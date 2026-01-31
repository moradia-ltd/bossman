import { EmailButton, EmailHeading, EmailLink, EmailText, EmailWrapper } from '#emails/layout'
import type { Emails } from '#types/mails'

function CustomerCompleteSubscription(props: Emails['customer-complete-subscription']) {
  return (
    <EmailWrapper>
      <EmailHeading>Complete your subscription</EmailHeading>
      <EmailText>Hi {props.fullName || 'there'},</EmailText>
      <EmailText>
        We've started setting up your account. To activate your subscription and get access, please
        complete the checkout by clicking the link below.
      </EmailText>
      <EmailButton href={props.url}>Complete subscription</EmailButton>
      <EmailText>
        If the button doesn&apos;t work, copy and paste this link into your browser:
      </EmailText>
      <EmailLink href={props.url}>{props.url}</EmailLink>
      <EmailText>This link will expire after a short time. If you need a new link, contact support.</EmailText>
    </EmailWrapper>
  )
}

export default CustomerCompleteSubscription
