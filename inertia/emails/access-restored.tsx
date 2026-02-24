import { EmailHeading, EmailText, EmailWrapper } from '#emails/layout'
import type { Emails } from '#types/mails'

function AccessRestored(props: Emails['access-restored']) {
  return (
    <EmailWrapper>
      <EmailHeading>Your access to Togetha has been restored</EmailHeading>
      <EmailText>Hi {props.fullName || 'there'},</EmailText>
      <EmailText>
        Your access to Togetha has been restored. You can sign in and use the platform again.
      </EmailText>
      <EmailText>
        Best regards,
        <br />
        The Togetha Team
      </EmailText>
    </EmailWrapper>
  )
}

export default AccessRestored
