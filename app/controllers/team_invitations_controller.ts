import { createHash } from 'node:crypto'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { appUrl } from '#emails/global'
import Team from '#models/team'
import TeamInvitation from '#models/team_invitation'
import TeamMember from '#models/team_member'
import User from '#models/user'
import { generateShortId } from '#services/app.functions'
import mailer from '#services/email_service'
import notificationService from '#services/notification_service'
import { getPageAccessForUser } from '#services/page_access_service'
import {
  acceptTeamInviteAuthedValidator,
  acceptTeamInviteGuestValidator,
  inviteToTeamValidator,
  updateInvitationValidator,
} from '#validators/team'

function hashInviteToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

type Trx = Awaited<ReturnType<typeof db.transaction>>

async function loadInvitationByToken(trx: Trx, token: string) {
  return TeamInvitation.query({ client: trx })
    .where('token_hash', hashInviteToken(token))
    .whereNull('accepted_at')
    .preload('team')
    .preload('invitedBy')
    .first()
}

async function ensureTeamMember(
  trx: Trx,
  invitation: TeamInvitation,
  userId: string,
  now: DateTime,
) {
  const existing = await TeamMember.query({ client: trx })
    .where('team_id', invitation.teamId)
    .where('user_id', userId)
    .first()
  if (!existing) {
    await TeamMember.create(
      {
        teamId: invitation.teamId,
        userId,
        role: invitation.role,
        allowedPages: invitation.allowedPages ?? null,
        createdAt: now,
        updatedAt: now,
      },
      { client: trx },
    )
  }
}

async function notifyInviter(invitation: TeamInvitation, joiningUser: User) {
  if (invitation.invitedByUserId) {
    await notificationService.push({
      userId: invitation.invitedByUserId,
      title: 'Team invite accepted',
      message: `${joiningUser.fullName || joiningUser.email} joined ${invitation.team.name}`,
      type: 'success',
    })
  }
  if (invitation.invitedBy?.email) {
    await mailer.send({
      type: 'team-joined',
      data: {
        email: invitation.invitedBy.email,
        inviterName: invitation.invitedBy.fullName || invitation.invitedBy.email,
        teamName: invitation.team.name,
        joinedUserEmail: joiningUser.email,
        joinedUserName: joiningUser.fullName || joiningUser.email,
      },
    })
  }
}

export default class TeamInvitationsController {
  async joinPage({ auth, inertia, request }: HttpContext) {
    const token = request.qs().token

    if (!token || typeof token !== 'string') {
      return inertia.render('teams/join', {
        invitation: null,
        error: 'Invite token is required.',
      })
    }

    const tokenHash = hashInviteToken(token)
    const now = DateTime.now()

    const invitation = await TeamInvitation.query()
      .where('token_hash', tokenHash)
      .preload('team')
      .preload('invitedBy')
      .first()

    if (!invitation) {
      return inertia.render('teams/join', {
        invitation: null,
        error: 'This invite link is invalid.',
      })
    }

    if (invitation.acceptedAt) {
      return inertia.render('teams/join', {
        invitation: null,
        error: 'This invite has already been accepted.',
      })
    }

    if (invitation.expiresAt.toMillis() < now.toMillis()) {
      return inertia.render('teams/join', {
        invitation: null,
        error: 'This invite link has expired.',
      })
    }

    const existingUser = await User.findBy('email', invitation.email)
    const authedUser = auth.user
    const isAuthedAsInvitee = Boolean(authedUser && authedUser.email === invitation.email)

    return inertia.render('teams/join', {
      invitation: {
        email: invitation.email,
        teamName: invitation.team.name,
        inviterName: invitation.invitedBy?.fullName || invitation.invitedBy?.email || 'Someone',
        role: invitation.role,
        invitedUserRole: invitation.invitedUserRole,
        teamKind: invitation.team.kind,
        allowedPages: invitation.allowedPages ?? null,
      },
      token,
      hasAccount: Boolean(existingUser),
      isAuthed: auth.isAuthenticated,
      isAuthedAsInvitee,
    })
  }

  async invite({ auth, request, response, now, logger }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)
    const { email, role, allowedPages } = await request.validateUsing(inviteToTeamValidator)

    if (!user.emailVerified) {
      return response.forbidden({
        error: 'Please verify your email address before inviting others.',
      })
    }

    const teamId = request.param('teamId')
    const team = await Team.findOrFail(teamId)
    const isAdminTeam = team.kind === 'admin'
    const isAdmin = (user as { role?: string }).role === 'admin'

    if (isAdminTeam && !isAdmin) {
      return response.forbidden({ error: 'Access required to invite to this team.' })
    }
    if (isAdminTeam) {
      const allowed = await getPageAccessForUser(freshUser.id)
      if (Array.isArray(allowed) && !allowed.includes('teams')) {
        return response.forbidden({ error: 'You do not have access to manage teams.' })
      }
    }

    if (!isAdminTeam) {
      const membership = await TeamMember.query()
        .where('team_id', teamId)
        .where('user_id', freshUser.id)
        .first()

      if (!membership || !['owner', 'admin'].includes(membership.role)) {
        return response.forbidden({
          error: 'You do not have permission to invite members to this team.',
        })
      }
    }

    const normalizedEmail = email.toLowerCase().trim()

    const resolvedAllowedPages = (() => {
      if (!isAdminTeam) return null
      const raw = Array.isArray(allowedPages) ? allowedPages : []
      const unique = Array.from(new Set(raw))
      // Always include the admin landing page so invitees don't get stuck.
      if (!unique.includes('dashboard')) unique.unshift('dashboard')
      return unique
    })()

    const existingUser = await User.findBy('email', normalizedEmail)
    if (existingUser) {
      const existingMember = await TeamMember.query()
        .where('team_id', teamId)
        .where('user_id', existingUser.id)
        .first()

      if (existingMember) {
        return response.conflict({ error: 'That user is already a member of this team.' })
      }
    }

    const nowSql = now.toSQL()
    if (!nowSql) {
      return response.internalServerError({
        error: 'Unable to process invite right now. Please try again.',
      })
    }

    const existingInvite = await TeamInvitation.query()
      .where('team_id', teamId)
      .where('email', normalizedEmail)
      .whereNull('accepted_at')
      .where('expires_at', '>', nowSql)
      .first()

    if (existingInvite) {
      return response.ok({ message: 'An active invite has already been sent to this email.' })
    }

    const token = generateShortId(48)
    const tokenHash = hashInviteToken(token)
    const expiresAt = DateTime.now().plus({ days: 7 })

    const trx = await db.transaction()

    try {
      const invitation = await TeamInvitation.create(
        {
          teamId: team.id,
          email: normalizedEmail,
          role: role ?? 'member',
          invitedUserRole: 'admin',
          allowedPages: resolvedAllowedPages,
          tokenHash,
          invitedByUserId: freshUser.id,
          expiresAt,
          acceptedAt: null,
          acceptedByUserId: null,
          createdAt: now,
          updatedAt: now,
        },
        { client: trx },
      )

      await trx.commit()

      const joinUrl = `${appUrl}/join?token=${token}`
      await mailer.send({
        type: 'team-invite',
        data: {
          email: normalizedEmail,
          inviterName: freshUser.fullName || freshUser.email,
          teamName: team.name,
          url: joinUrl,
        },
      })

      logger.info('Team invite sent', {
        teamId: team.id,
        email: normalizedEmail,
        invitationId: invitation.id,
      })

      return response.created({ message: 'Invite sent successfully.' })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async accept({ auth, request, response, now }: HttpContext) {
    const trx = await db.transaction()
    const rollback = async <T>(result: T) => {
      await trx.rollback()
      return result
    }

    try {
      const isAuthed = auth.isAuthenticated
      let token: string
      let guestPayload: { fullName: string; password: string } | null = null

      if (isAuthed) {
        ;({ token } = await request.validateUsing(acceptTeamInviteAuthedValidator))
      } else {
        const guest = await request.validateUsing(acceptTeamInviteGuestValidator)
        token = guest.token
        guestPayload = { fullName: guest.fullName, password: guest.password }
      }

      const invitation = await loadInvitationByToken(trx, token)
      if (!invitation) {
        return rollback(
          response.badRequest({ error: 'Invite is invalid or has already been used.' }),
        )
      }
      if (invitation.expiresAt.toMillis() < DateTime.now().toMillis()) {
        return rollback(response.badRequest({ error: 'Invite has expired.' }))
      }

      const { fullName, password } = guestPayload!
      const existingUser = await User.query({ client: trx })
        .where('email', invitation.email)
        .first()
      if (existingUser) {
        return rollback(
          response.conflict({
            error: 'An account with this email already exists. Please log in to accept the invite.',
          }),
        )
      }
      const newUser = await User.create(
        {
          fullName,
          email: invitation.email,
          password,
          emailVerified: true,
          emailVerifiedAt: now,
          token: null,
          role: invitation.invitedUserRole,
        },
        { client: trx },
      )

      await ensureTeamMember(trx, invitation, newUser.id, now)
      if (
        invitation.invitedUserRole === 'admin' &&
        (newUser as unknown as { role?: string }).role !== 'admin'
      ) {
        await newUser.merge({ role: 'admin' }).save()
      }

      await invitation.merge({ acceptedAt: now, acceptedByUserId: newUser.id }).save()
      await trx.commit()

      if (!isAuthed) await auth.use('web').login(newUser)
      await notifyInviter(invitation, newUser)

      return response.ok({
        message: isAuthed
          ? 'You have joined the team.'
          : 'Account created and team joined successfully.',
        redirectTo: invitation.invitedUserRole === 'admin' ? '/dashboard' : '/teams',
      })
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async updateInvitation({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const freshUser = await User.findByOrFail('email', user.email)
    const teamId = request.param('teamId')
    const invitationId = request.param('invitationId')

    const team = await Team.findOrFail(teamId)
    if (team.kind !== 'admin') {
      return response.forbidden({ error: 'Only dashboard team invitations can be updated here.' })
    }
    if ((user as { role?: string }).role !== 'admin') {
      return response.forbidden({ error: 'Access required.' })
    }
    const allowed = await getPageAccessForUser(freshUser.id)
    if (Array.isArray(allowed) && !allowed.includes('teams')) {
      return response.forbidden({ error: 'You do not have access to manage teams.' })
    }

    const invitation = await TeamInvitation.query()
      .where('team_id', teamId)
      .where('id', invitationId)
      .whereNull('accepted_at')
      .firstOrFail()

    const body = await request.validateUsing(updateInvitationValidator)
    if (body.allowedPages !== undefined) {
      const pages = Array.isArray(body.allowedPages) ? body.allowedPages : null
      const resolved = pages?.length ? [...pages] : null
      if (resolved && !resolved.includes('dashboard')) {
        resolved.unshift('dashboard')
      }
      invitation.allowedPages = resolved?.length ? resolved : null
      await invitation.save()
    }

    return response.ok({
      message: 'Invitation updated successfully',
      data: {
        id: invitation.id,
        allowedPages: invitation.allowedPages ?? null,
      },
    })
  }
}
