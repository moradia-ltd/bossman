import axios, { type AxiosInstance } from 'axios'
import env from '#start/env'

const RAILWAY_GRAPHQL = 'https://backboard.railway.app/graphql/v2'

export interface RailwayProject {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface RailwayService {
  id: string
  name: string
  icon: string | null
}

export interface RailwayEnvironment {
  id: string
  name: string
}

export interface RailwayDeployment {
  id: string
  status: string
  createdAt: string
  meta: string | null
  canRedeploy: boolean
  canRollback: boolean
}

export interface RailwayProjectDetail extends RailwayProject {
  services: RailwayService[]
  environments: RailwayEnvironment[]
}

export interface RailwayRuntimeLog {
  message: string
  timestamp: string
  level?: string
}

function createClient(): AxiosInstance {
  const token = env.get('RAILWAY_API_KEY')
  return axios.create({
    baseURL: RAILWAY_GRAPHQL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
}

export class RailwayApiService {
  private client = createClient()

  private async graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const { data } = await this.client.post<{ data?: T; errors?: Array<{ message: string }> }>('', {
      query,
      variables,
    })
    if (data.errors?.length) {
      throw new Error(data.errors.map((e) => e.message).join('; '))
    }
    if (data.data == null) {
      throw new Error('No data returned from Railway API')
    }
    return data.data
  }

  async listProjects(): Promise<RailwayProject[]> {
    const data = await this.graphql<{
      projects: { edges: Array<{ node: RailwayProject }> }
    }>(`
      query {
        projects {
          edges {
            node {
              id
              name
              description
              createdAt
              updatedAt
            }
          }
        }
      }
    `)
    return data.projects.edges.map((e) => e.node)
  }

  async getProject(projectId: string): Promise<RailwayProjectDetail | null> {
    const data = await this.graphql<{
      project: {
        id: string
        name: string
        description: string | null
        createdAt: string
        updatedAt: string
        services: { edges: Array<{ node: RailwayService }> }
        environments: { edges: Array<{ node: RailwayEnvironment }> }
      } | null
    }>(
      `
      query project($id: String!) {
        project(id: $id) {
          id
          name
          description
          createdAt
          updatedAt
          services {
            edges {
              node {
                id
                name
                icon
              }
            }
          }
          environments {
            edges {
              node {
                id
                name
              }
            }
          }
        }
      }
    `,
      { id: projectId },
    )
    const p = data.project
    if (!p) return null
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      services: p.services.edges.map((e) => e.node),
      environments: p.environments.edges.map((e) => e.node),
    }
  }

  async getDeployments(
    projectId: string,
    serviceId: string,
    environmentId: string,
    limit: number = 5,
  ): Promise<RailwayDeployment[]> {
    const data = await this.graphql<{
      deployments: { edges: Array<{ node: RailwayDeployment }> }
    }>(
      `
      query deployments($first: Int!, $input: DeploymentListInput!) {
        deployments(first: $first, input: $input) {
          edges {
            node {
              id
              status
              createdAt
              meta
              canRedeploy
              canRollback
            }
          }
        }
      }
    `,
      {
        first: limit,
        input: { projectId, environmentId, serviceId },
      },
    )
    return (data.deployments?.edges ?? []).map((e) => e.node)
  }

  async getDeploymentRuntimeLogs(deploymentId: string): Promise<RailwayRuntimeLog[]> {
    const data = await this.graphql<{
      deploymentLogs: { edges: Array<{ node: RailwayRuntimeLog }> }
    }>(
      `
      query deploymentLogs($deploymentId: String!) {
        deploymentLogs(deploymentId: $deploymentId, type: RUNTIME) {
          edges {
            node {
              message
              timestamp
              level
            }
          }
        }
      }
    `,
      { deploymentId },
    )
    return (data.deploymentLogs?.edges ?? []).map((e) => e.node)
  }

  async deploymentRestart(deploymentId: string): Promise<boolean> {
    const data = await this.graphql<{ deploymentRestart: boolean }>(
      `
      mutation deploymentRestart($deploymentId: String!) {
        deploymentRestart(deploymentId: $deploymentId)
      }
    `,
      { deploymentId },
    )
    return data.deploymentRestart === true
  }

  async deploymentRedeploy(deploymentId: string): Promise<string | null> {
    const data = await this.graphql<{ deploymentRedeploy: string | null }>(
      `
      mutation deploymentRedeploy($deploymentId: String!) {
        deploymentRedeploy(deploymentId: $deploymentId)
      }
    `,
      { deploymentId },
    )
    return data.deploymentRedeploy
  }
}
