declare module '@adonisjs/core/types' {
  interface Emails {
    'customer-account-created': {
      email: string
      fullName: string
    }
    'customer-complete-subscription': {
      email: string
      fullName: string
      url: string
    }
    'customer-price-updated': {
      email: string
      fullName: string
      url: string
      amount: number
      currency: string
    }
    'forgot-password': {
      email: string
      fullName: string
      token: string
    }
    'reset-password': {
      email: string
      fullName: string
      url?: string
    }
    'simple-send': {
      subject: string
      email: string
      body: string
      from?: string
      replyTo?: string
      name?: string
    }
    'verify-email': {
      email: string
      fullName: string
      url: string
    }
    'verify-email-change': {
      email: string
      fullName: string
      url: string
    }
    welcome: {
      email: string
      fullName: string
    }
    goodbye: {
      email: string
      fullName: string
    }
    'password-changed': {
      email: string
      fullName: string
    }
    'team-invite': {
      email: string
      inviterName: string
      teamName: string
      url: string
    }
    'team-joined': {
      email: string
      inviterName: string
      teamName: string
      joinedUserEmail: string
      joinedUserName: string
    }
    'access-revoked': {
      email: string
      fullName?: string | null
      reason: string
    }
    'access-restored': {
      email: string
      fullName?: string | null
    }
    'custom-user-delete-request': {
      email: string
      fullName: string
      acceptUrl: string
      declineUrl: string
    }
  }
}
