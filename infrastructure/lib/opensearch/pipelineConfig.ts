import { aws_dynamodb as dynamodb } from 'aws-cdk-lib'

export const pipelineConfig = (
  dynamoDbTable: dynamodb.TableV2,
  s3BucketName: string,
  iamRoleArn: string,
  openSearchHost: string,
  networkName: string,
  sink: string
) => `
  version: "2"
  dynamo-pipeline:
    source:
      dynamodb:
        tables:
          - table_arn: "${dynamoDbTable.tableArn}"
            export:
              s3_bucket: "${s3BucketName}"
              s3_region: "us-west-2"
              s3_prefix: "${dynamoDbTable.tableName}/"
            stream:
              start_position: "LATEST"
              view_on_remove: NEW_IMAGE
        aws:
          region: "us-west-2"
          sts_role_arn: "${iamRoleArn}"
    sink: 
      - opensearch:
          hosts:
            - "${openSearchHost}"
          index: "${sink}"
          routes:
            - ${sink}
          document_id: '\${getMetadata("primary_key")}'
          action: '\${getMetadata("opensearch_action")}'
          aws:
            sts_role_arn: "${iamRoleArn}"
            region: "us-west-2"
            serverless: true
            serverless_options:
              network_policy_name: "${networkName}"
          dlq:
            s3:
              bucket: "${s3BucketName}"
              key_path_prefix: "dlq/record"
              region: "us-west-2"
              sts_role_arn: "${iamRoleArn}"
`
