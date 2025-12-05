import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'
import { Distribution, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront'
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment'

export class SpinClientStack extends Stack {
  public constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    const deploymentBucket = new Bucket(this, 'DeploymentBucketSpinClient', {
      bucketName: 'deployment-bucket-spin-client',
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      blockPublicAccess: {
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      },
      publicReadAccess: true,
      // websiteIndexDocument: 'client/index.html',
    })

    const cloudfrontDistro = new Distribution(this, 'SpinClientDistribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(deploymentBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: 'client/index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/client/index.html',
          ttl: Duration.seconds(1),
        },
      ],
    })

    new BucketDeployment(this, 'SpinClientDeployment', {
      destinationBucket: deploymentBucket,
      sources: [Source.asset('./spin-web-client/build')],
      distribution: cloudfrontDistro,
      distributionPaths: ['/*'],
      retainOnDelete: false,
    })

    new CfnOutput(this, 'CloudfrontDomain', {
      value: cloudfrontDistro.domainName,
      description: 'Cloudfront URL',
    })
  }
}
