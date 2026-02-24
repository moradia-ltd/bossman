import { EmailButton, EmailHeading, EmailText, EmailWrapper } from '#emails/layout'
import type { Emails } from '#types/mails'

function CustomUserDeleteRequest(props: Emails['custom-user-delete-request']) {
  return (
    <EmailWrapper>
      <EmailHeading>Request to delete your account</EmailHeading>
      <EmailText>Hi {props.fullName},</EmailText>
      <EmailText>
        We received a request to permanently delete your account and all associated data. This
        action cannot be undone.
      </EmailText>
      <EmailText>Please choose one of the options below:</EmailText>
      <EmailButton href={props.acceptUrl} variant='default'>
        Accept – delete my account
      </EmailButton>
      <EmailText>Or click below to keep your account:</EmailText>
      <EmailButton href={props.declineUrl} variant='destructive'>
        Decline – keep my account
      </EmailButton>
      <EmailText>
        If you accept, you will be redirected to a confirmation page and your account will be
        permanently deleted. If you decline, no changes will be made.
      </EmailText>
      <EmailText>
        If you did not request this, you can safely ignore this email or click Decline.
      </EmailText>
    </EmailWrapper>
  )
}

export default CustomUserDeleteRequest
