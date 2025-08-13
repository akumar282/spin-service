import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3'
import { Distribution } from 'aws-cdk-lib/aws-cloudfront'
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'

export class SpinClientStack extends Stack {
  public constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)

    const deploymentBucket = new Bucket(this, 'DeploymentBucketSpinClient', {
      bucketName: 'DeploymentBucketSpinClient',
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const cloudfrontDistro = new Distribution(this, 'SpinClientDistribution', {
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessControl(deploymentBucket),
      },
    })
  }
}
