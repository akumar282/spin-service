import {
  CompositePrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

export const pipelineRole = (scope: Construct): Role => {
  return new Role(scope, 'OpenSearchPipeline', {
    roleName: 'OpenSearchPipelineRole',
    assumedBy: new CompositePrincipal(
      new ServicePrincipal('osis-pipelines.amazonaws.com'),
      new ServicePrincipal('opensearchservice.amazonaws.com')
    ),
    inlinePolicies: {
      OpenSearchPolicy: new PolicyDocument({
        statements: [
          new PolicyStatement({
            sid: 'allowDescribeTable',
            effect: Effect.ALLOW,
            actions: ['dynamodb:DescribeTable'],
            resources: ['*'],
          }),
          new PolicyStatement({
            sid: 'allowRunExportJob',
            effect: Effect.ALLOW,
            actions: [
              'dynamodb:DescribeContinuousBackups',
              'dynamodb:ExportTableToPointInTime',
            ],
            resources: ['*'],
          }),
          new PolicyStatement({
            sid: 'allowCheckExportjob',
            effect: Effect.ALLOW,
            actions: ['dynamodb:DescribeExport'],
            resources: ['*'],
          }),
          new PolicyStatement({
            sid: 'allowReadFromStream',
            effect: Effect.ALLOW,
            actions: [
              'dynamodb:DescribeStream',
              'dynamodb:ExportTableToPointInTime',
              'dynamodb:DescribeExport',
              'dynamodb:GetRecords',
              'dynamodb:GetShardIterator',
            ],
            resources: ['*'],
          }),
          new PolicyStatement({
            sid: 'allowReadAndWriteToS3ForExport',
            effect: Effect.ALLOW,
            actions: [
              's3:ListBucket',
              's3:GetObject',
              's3:AbortMultipartUpload',
              's3:PutObject',
              's3:PutObjectAcl',
            ],
            resources: ['*'],
          }),
          new PolicyStatement({
            sid: 'allowBatchGet',
            effect: Effect.ALLOW,
            actions: ['aoss:*'],
            resources: ['*'],
          }),
          new PolicyStatement({
            actions: ['es:DescribeDomain'],
            resources: ['*'],
            effect: Effect.ALLOW,
          }),
          new PolicyStatement({
            actions: ['es:ESHttp*'],
            resources: ['*'],
            effect: Effect.ALLOW,
          }),
        ],
      }),
    },
  })
}
