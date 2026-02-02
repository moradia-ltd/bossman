import app from '@adonisjs/core/services/app'
import { defineConfig, OTLPTraceExporter } from '@adonisjs/otel'
import env from '#start/env'

export default defineConfig({
  serviceName: env.get('APP_NAME'),
  serviceVersion: env.get('APP_VERSION'),
  environment: env.get('APP_ENV'),
  traceExporter: new OTLPTraceExporter({
    url: 'https://us-east-1.aws.edge.axiom.co/v1/traces',
    headers: {
      Authorization: `Bearer ${env.get('AXIOM_TOKEN')}`,
      'X-Axiom-Dataset': env.get('AXIOM_DATASET') as string,
    },
  }),
  // samplingRatio: app ? 1.0 : 0.1,
})
