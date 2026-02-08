import type { HttpContext } from '@adonisjs/core/http'
import { getPageAccessForUser } from '#services/page_access_service'
import { RailwayApiService } from '#services/railway_service'

async function ensureServersAccess(ctx: HttpContext) {
  const user = ctx.auth.getUserOrFail()
  if (!user.isAdminOrSuperAdmin) {
    return ctx.response.forbidden()
  }

  const allowed = await getPageAccessForUser(user.id)
  if (Array.isArray(allowed) && !allowed.includes('servers')) {
    return ctx.response.forbidden()
  }
  return null
}

export default class RailwayController {
  async projects(ctx: HttpContext) {
    const err = await ensureServersAccess(ctx)
    if (err) return err

    const service = new RailwayApiService()
    try {
      const projects = await service.listProjects()
      return ctx.response.ok(projects)
    } catch (err) {
      return ctx.response.badRequest({
        message: err instanceof Error ? err.message : 'Failed to fetch Railway projects',
      })
    }
  }

  async project(ctx: HttpContext) {
    const err = await ensureServersAccess(ctx)
    if (err) return err
    const { params, response } = ctx
    const service = new RailwayApiService()
    try {
      const project = await service.getProject(params.id)
      if (!project) return response.notFound({ message: 'Project not found' })
      return response.ok(project)
    } catch (err) {
      return response.badRequest({
        message: err instanceof Error ? err.message : 'Failed to fetch Railway project',
      })
    }
  }

  async deployments(ctx: HttpContext) {
    const err = await ensureServersAccess(ctx)
    if (err) return err
    const { params, request, response } = ctx
    const environmentId = request.qs().environmentId as string | undefined
    const projectId = (request.qs().projectId as string | undefined) ?? ''
    if (!environmentId) {
      return response.badRequest({ message: 'environmentId is required' })
    }
    const service = new RailwayApiService()
    try {
      const deployments = await service.getDeployments(
        projectId,
        params.serviceId,
        environmentId,
        5,
      )
      return response.ok(deployments)
    } catch (err) {
      return response.badRequest({
        message: err instanceof Error ? err.message : 'Failed to fetch deployments',
      })
    }
  }

  async deploymentLogs(ctx: HttpContext) {
    const err = await ensureServersAccess(ctx)
    if (err) return err
    const { params, response } = ctx
    const service = new RailwayApiService()
    try {
      const logs = await service.getDeploymentRuntimeLogs(params.id)
      return response.ok(logs)
    } catch (err) {
      return response.badRequest({
        message: err instanceof Error ? err.message : 'Failed to fetch deployment logs',
      })
    }
  }

  async deploymentRestart(ctx: HttpContext) {
    const err = await ensureServersAccess(ctx)
    if (err) return err
    const { params, response } = ctx
    const service = new RailwayApiService()
    try {
      await service.deploymentRestart(params.id)
      return response.ok({ success: true })
    } catch (err) {
      return response.badRequest({
        message: err instanceof Error ? err.message : 'Failed to restart deployment',
      })
    }
  }

  async deploymentRedeploy(ctx: HttpContext) {
    const err = await ensureServersAccess(ctx)
    if (err) return err
    const { params, response } = ctx
    const service = new RailwayApiService()
    try {
      const deploymentId = await service.deploymentRedeploy(params.id)
      return response.ok({ success: true, deploymentId })
    } catch (err) {
      return response.badRequest({
        message: err instanceof Error ? err.message : 'Failed to redeploy',
      })
    }
  }
}
