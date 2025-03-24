import { aws_dynamodb as dynamodb } from 'aws-cdk-lib'

export const pipelineConfig = (
  dynamoDbTable: dynamodb.TableV2,
  dynamoDbTable2: dynamodb.TableV2,
  s3BucketName: string,
  iamRoleArn: string,
  openSearchHost: string,
  networkName: string
) => `
  version: "2"
  dynamo-pipeline:
    source:
      dynamodb:
        tables:
          - table_arn: "${dynamoDbTable.tableArn}"
            export:
              s3_bucket: "${s3BucketName}"
              s3_prefix: "${dynamoDbTable.tableName}"
            stream:
              start_position: "LATEST"
              view_on_remove: NEW_IMAGE
          - table_arn: "${dynamoDbTable2.tableArn}"
            export:
              s3_bucket: "${s3BucketName}"
              s3_prefix: "${dynamoDbTable2.tableName}"
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
          index: "user"
          routes:
            - "user"
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
              key_path_prefix: "dlq/user"
              region: "us-west-2"
              sts_role_arn: "${iamRoleArn}"
      - opensearch:
          hosts:
            - "${openSearchHost}"
          index: "record"
          routes:
            - "record"
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
              sts_role_arn: "${iamRoleArn}"\\
`
