import { EmailHeading, EmailText, EmailWrapper } from '#emails/layout'
import type { Emails } from '#types/mails'

function TeamJoined(props: Emails['team-joined']) {
  return (
    <EmailWrapper>
      <EmailHeading>Someone accepted your invite</EmailHeading>
      <EmailText>
        Hi {props.inviterName || 'there'},
      </EmailText>
      <EmailText>
        <strong>{props.joinedUserName}</strong> ({props.joinedUserEmail}) accepted your invite.
      </EmailText>
    </EmailWrapper>
  )
}

export default TeamJoined

