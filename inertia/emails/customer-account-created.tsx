import { EmailHeading, EmailText, EmailWrapper } from '#emails/layout'
import type { Emails } from '#types/mails'

function CustomerAccountCreated(props: Emails['customer-account-created']) {
  return (
    <EmailWrapper>
      <EmailHeading>Your account has been created</EmailHeading>
      <EmailText>Hi {props.fullName || 'there'},</EmailText>
      <EmailText>
        We've created an account for you. Your subscription is set up and you can sign in to get
        started.
      </EmailText>
      <EmailText>
        If you have any questions or need help, feel free to reach out to our support team.
      </EmailText>
      <EmailText>Welcome aboard!</EmailText>
    </EmailWrapper>
  )
}

export default CustomerAccountCreated
