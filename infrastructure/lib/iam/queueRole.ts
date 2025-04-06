import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

export const queueRole = (scope: Construct): Role => {
  return new Role(scope, 'sqs-queue-role', {
    roleName: 'ProcessingQueueRole',
    assumedBy: new ServicePrincipal('pipes.amazonaws.com'),
    inlinePolicies: {
      ProcessingQueuePolicies: new PolicyDocument({
        statements: [
          new PolicyStatement({
            sid: 'allowReadFromStream',
            effect: Effect.ALLOW,
            actions: [
              'dynamodb:DescribeStream',
              'dynamodb:GetRecords',
              'dynamodb:GetShardIterator',
              'dynamodb:ListStreams',
            ],
            resources: ['*'],
          }),
          new PolicyStatement({
            sid: 'SendSQSMessage',
            effect: Effect.ALLOW,
            actions: ['sqs:SendMessage'],
            resources: ['*'],
          }),
        ],
      }),
    },
  })
}
