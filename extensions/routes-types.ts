
export const API_ROUTES = {
  GET: ['/dashboard/stats',
    '/dashboard/activity',
    '/leases/stats',
    '/leases/:id/payments',
    '/leases/:id/activity',
    '/leaseable-entities/stats',
    '/leaseable-entities/:id/leases',
    '/leaseable-entities/:id/activity',
    '/orgs/stats',
    '/orgs/:orgId/ban-status',
    '/orgs/:id/leases',
    '/orgs/:id/properties',
    '/orgs/:id/activities',
    '/orgs/:id/invoices',
    '/push-notifications/users',
    '/auth/verify-email',
    '/auth/verify-email-change',
    '/user/sessions',
    '/user/settings',
    '/members',
    '/members/invitations',
    '/notifications',
    '/notifications/unread-count',
    '/audits',
    '/audits/recent',
    '/update-env'] as const,
  POST: ['/orgs',
    '/orgs/:orgId/actions/ban-user',
    '/orgs/:orgId/actions/unban-user',
    '/orgs/:orgId/actions/make-favourite',
    '/orgs/:orgId/actions/undo-favourite',
    '/orgs/:orgId/actions/make-test-account',
    '/orgs/:orgId/actions/undo-test-account',
    '/orgs/actions/bulk-make-favourite',
    '/orgs/actions/bulk-undo-favourite',
    '/orgs/actions/bulk-make-test-account',
    '/orgs/actions/bulk-undo-test-account',
    '/db-backups',
    '/db-backups/:id/restore',
    '/auth/login',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email/resend',
    '/user/avatar',
    '/user/sessions/revoke',
    '/user/sessions/revoke-all',
    '/user/2fa/setup',
    '/user/2fa/enable',
    '/user/2fa/disable',
    '/user/2fa/verify',
    '/user/2fa/recovery-codes',
    '/invitations',
    '/team-invitations/accept',
    '/notifications/mark-as-read',
    '/notifications/mark-all-as-read'] as const,
  PUT: ['/orgs/:id',
    '/update-env',
    '/user/profile',
    '/user/password',
    '/user/settings',
    '/members/:memberId',
    '/invitations/:invitationId'] as const,
  DELETE: ['/user/avatar',
    '/user/account',
    '/notifications/:id'] as const,
};

type ReplaceParam<T extends string> =
  T extends `${infer Start}:${infer Param}/${infer Rest}`
    ? `${Start}${string}/${ReplaceParam<Rest>}`
    : T extends `${infer Start}:${infer Param}`
      ? `${Start}${string}`
      : T;

type TransformRoutes<T extends readonly string[]> = {
  [K in keyof T]: T[K] | ReplaceParam<T[K]>;
}[number];

export type APIRoutes = {
  [K in keyof typeof API_ROUTES]: TransformRoutes<typeof API_ROUTES[K]>;
};

export type APIRouteStatic = {
  [K in keyof typeof API_ROUTES]: typeof API_ROUTES[K][number];
};

// Usage example:
// const apiRoutes: APIRoutes = API_ROUTES as any;
