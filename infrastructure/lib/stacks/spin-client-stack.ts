import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'
import {
  CfnOriginAccessControl,
  Distribution,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { SpinClientStackProps } from './stackProps'
import { AaaaRecord, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53'
import { getEnv } from '../shared/utils'
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets'

export class SpinClientStack extends Stack {
  public constructor(
    scope: Construct,
    id: string,
    props: SpinClientStackProps
  ) {
    super(scope, id, props)

    const env = getEnv('ENV')

    const deploymentBucket = new Bucket(this, 'DeploymentBucketSpinClient', {
      bucketName: 'deployment-bucket-spin-client',
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    })

    const accessControl = new CfnOriginAccessControl(this, 'OAC', {
      originAccessControlConfig: {
        name: 'SpinClientControl',
        originAccessControlOriginType: 's3',
        signingBehavior: 'always',
        signingProtocol: 'sigv4',
      },
    })

    const cloudfrontDistro = new Distribution(this, 'SpinClientDistribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(deploymentBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.seconds(0),
        },
      ],
      domainNames: [props.sub],
      certificate: props.certificate,
    })

    new BucketDeployment(this, 'SpinClientDeployment', {
      destinationBucket: deploymentBucket,
      sources: [Source.asset('./spin-web-client/build/client')],
      distribution: cloudfrontDistro,
      distributionPaths: ['/*'],
      retainOnDelete: false,
    })

    new StringParameter(this, 'CloudDistro', {
      parameterName: '/domain/endpoint',
      stringValue: `https://${cloudfrontDistro.domainName}`,
    })

    new CfnOutput(this, 'CloudfrontDomain', {
      exportName: 'CloudfrontDomain',
      value: cloudfrontDistro.domainName,
      description: 'Cloudfront URL',
    })

    new ARecord(this, `Arecord-${env}`, {
      zone: props.zone,
      recordName: env === 'prod' ? 'www' : 'dev',
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfrontDistro)),
    })

    new AaaaRecord(this, `AaaaRecord-${env}`, {
      zone: props.zone,
      recordName: env === 'prod' ? 'www' : 'dev',
      target: RecordTarget.fromAlias(new CloudFrontTarget(cloudfrontDistro)),
    })
  }
}
