import { EmailHeading, EmailText, EmailWrapper } from '#emails/layout'
import type { Emails } from '#types/mails'

function AccessRevoked(props: Emails['access-revoked']) {
  return (
    <EmailWrapper>
      <EmailHeading>Your access to Togetha has been revoked</EmailHeading>
      <EmailText>Hi {props.fullName || 'there'},</EmailText>
      <EmailText>
        Your access to Togetha has been revoked. You can no longer sign in or use the platform.
      </EmailText>
      <EmailText>
        <strong>Reason:</strong> {props.reason}
      </EmailText>
      <EmailText>
        If you believe this was done in error or would like to appeal, please contact support.
      </EmailText>
      <EmailText>Best regards,<br />The Togetha Team</EmailText>
    </EmailWrapper>
  )
}

export default AccessRevoked
