import { aws_opensearchserverless as oss } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { getEnv } from '../shared/utils'

export type OpenSearchProps = {
  collectionName: string
  pipelineRoleArn: string
}

export class OpenSearchIngestion {
  public networkName: string
  public collectionEndpoint: string

  constructor(scope: Construct, id: string, props: OpenSearchProps) {
    const collection = new oss.CfnCollection(
      scope,
      'OpenSearchRecordsCluster',
      {
        name: props.collectionName,
        description: 'Integrate Table with improved search',
        standbyReplicas: 'ENABLED',
        tags: [{ key: 'SpinServiceRecords', value: 'SpinServiceRecords' }],
        type: 'SEARCH',
      }
    )

    const encryptionPolicy = new oss.CfnSecurityPolicy(
      scope,
      'EncryptionPolicy',
      {
        name: 'ddb-etl-encryption-policy',
        type: 'encryption',
        description: `Encryption policy for ${props.collectionName} collection.`,
        policy: `
      {
        "Rules": [
          {
            "ResourceType": "collection",
            "Resource": ["collection/${props.collectionName}*"]
          }
        ],
        "AWSOwnedKey": true
      }
      `,
      }
    )

    const networkPolicy = new oss.CfnSecurityPolicy(scope, 'NetworkPolicy', {
      name: 'ddb-etl-network-policy',
      type: 'network',
      description: `Network policy for ${props.collectionName} collection.`,
      policy: `
        [
          {
            "Rules": [
              {
                "ResourceType": "collection",
                "Resource": ["collection/${props.collectionName}"]
              },
              {
                "ResourceType": "dashboard",
                "Resource": ["collection/${props.collectionName}"]
              }
            ],
            "AllowFromPublic": true
          }
        ]
      `,
    })

    const dataAccessPolicy = new oss.CfnAccessPolicy(
      scope,
      'DataAccessPolicy',
      {
        name: 'ddb-etl-access-policy',
        type: 'data',
        description: `Data access policy for ${props.collectionName} collection.`,
        policy: `
        [
          {
            "Rules": [
              {
                "ResourceType": "collection",
                "Resource": ["collection/${props.collectionName}*"],
                "Permission": [
                  "aoss:CreateCollectionItems",
                  "aoss:DescribeCollectionItems",
                  "aoss:DeleteCollectionItems",
                  "aoss:UpdateCollectionItems"
                ]
              },
              {
                "ResourceType": "index",
                "Resource": [
                  "index/${props.collectionName}/*", 
                  "index/${props.collectionName}/records", 
                  "index/${props.collectionName}/users"
                ],
                "Permission": [
                  "aoss:CreateIndex",
                  "aoss:DeleteIndex",
                  "aoss:UpdateIndex",
                  "aoss:DescribeIndex",
                  "aoss:ReadDocument",
                  "aoss:WriteDocument"
                ]
              }
            ],
            "Principal": [
              "${props.pipelineRoleArn}",
              "arn:aws:iam::${getEnv('ACCOUNT')}:root"
            ]
          }
        ]
      `,
      }
    )

    this.networkName = networkPolicy.name
    this.collectionEndpoint = collection.attrCollectionEndpoint

    collection.node.addDependency(encryptionPolicy)
    collection.node.addDependency(networkPolicy)
    collection.node.addDependency(dataAccessPolicy)
  }

  public getNetworkName(): string {
    return this.networkName
  }

  public getEndpoint(): string {
    return this.collectionEndpoint
  }
}
