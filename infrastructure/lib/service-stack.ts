import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

export class ServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.stackProps ) {
    super(scope, id, props)
  }
}