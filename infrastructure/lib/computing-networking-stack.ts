import { RemovalPolicy, SecretValue, Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import { LogGroup } from 'aws-cdk-lib/aws-logs'
import { FargateTask } from './fargate/fargateTask'
import { SESConstruct } from './ses/ses'
import { ComputingNetworkStackProps } from './cdkExtendedProps'

export class ComputingNetworkingStack extends Stack {
  public constructor(
    scope: Construct,
    id: string,
    props: ComputingNetworkStackProps
  ) {
    super(scope, id, props)

    const mailer = new SESConstruct(this, 'SpinMailer', {
      existingHostedZone: {
        hostedZoneId: props.zone_id,
        zoneName: props.zone_name,
      },
      privateKey: SecretValue.unsafePlainText(props.ses_private_key),
      publicKey: props.ses_public_key,
    })

    const cluster = new ecs.Cluster(this, 'spinServiceCluster', {
      enableFargateCapacityProviders: true,
      vpc: props.vpc,
    })

    const logGroup = new LogGroup(this, 'DataAggLogGroup', {
      logGroupName: '/ecs/spinServiceContainer',
      removalPolicy: RemovalPolicy.DESTROY,
    })

    new FargateTask(
      this,
      'fargateTaskId',
      {
        taskDefId: 'spinServiceTaskId',
        container: {
          id: 'spinServiceContainer',
          assetPath: './image',
        },
        enableDlq: true,
      },
      props.vpc,
      cluster,
      {
        environment: {
          API_URL: props.api.url,
          DISCOGS_TOKEN: props.discogs_token,
          PROXY_IP: props.proxy_ip,
        },
        logs: logGroup,
      }
    )
  }
}
