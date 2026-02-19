
export const API_ROUTES = {
  GET: ['/analytics/orgs/stats',
    '/analytics/orgs/entities',
    '/analytics/users/stats',
    '/analytics/users/entities',
    '/analytics/leases/stats',
    '/analytics/leases/entities',
    '/analytics/maintenance/stats',
    '/analytics/maintenance/entities',
    '/analytics/activity/stats',
    '/analytics/activity/entities',
    '/dashboard/stats',
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
    '/emails',
    '/emails/:id',
    '/railway/projects',
    '/railway/projects/:id',
    '/railway/services/:serviceId/deployments',
    '/railway/deployments/:id/logs/runtime',
    '/update-env',
    '/auth/verify-email',
    '/auth/verify-email-change',
    '/user/sessions',
    '/user/settings',
    '/members',
    '/members/invitations',
    '/members/data-access-options',
    '/notifications',
    '/notifications/unread-count',
    '/audits',
    '/audits/recent'] as const,
  POST: ['/orgs',
    '/orgs/:orgId/actions/ban-user',
    '/orgs/:orgId/actions/unban-user',
    '/orgs/:orgId/actions/make-favourite',
    '/orgs/:orgId/actions/undo-favourite',
    '/orgs/:orgId/actions/make-test-account',
    '/orgs/:orgId/actions/undo-test-account',
    '/orgs/:orgId/actions/toggle-sales-account',
    '/orgs/:orgId/actions/request-delete-custom-user',
    '/orgs/actions/bulk-make-favourite',
    '/orgs/actions/bulk-undo-favourite',
    '/orgs/actions/bulk-make-test-account',
    '/orgs/actions/bulk-undo-test-account',
    '/db-backups',
    '/db-backups/:id/restore',
    '/railway/deployments/:id/restart',
    '/railway/deployments/:id/redeploy',
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
