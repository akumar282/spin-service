import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'
import { getEnv } from '../shared/utils'

export const schedulerRole = (scope: Construct): Role => {
  return new Role(scope, 'scheduleRole', {
    assumedBy: new ServicePrincipal('scheduler.amazonaws.com'),
    inlinePolicies: {
      FargateScrapePolicy: new PolicyDocument({
        statements: [
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['ecs:RunTask'],
            resources: [
              `arn:aws:ecs:${getEnv('REGION')}:${getEnv(
                'ACCOUNT'
              )}:task-definition/*`,
              `arn:aws:ecs:${getEnv('REGION')}:${getEnv('ACCOUNT')}:cluster/*`,
            ],
          }),
          new PolicyStatement({
            effect: Effect.ALLOW,
            actions: ['iam:PassRole'],
            resources: ['*'],
          }),
        ],
      }),
    },
  })
}
