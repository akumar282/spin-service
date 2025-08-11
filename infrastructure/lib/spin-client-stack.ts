import { Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'

export class SpinClientStack extends Stack {
  public constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)
  }
}
