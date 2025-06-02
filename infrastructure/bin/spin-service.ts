import * as cdk from 'aws-cdk-lib'
import { SpinServiceStack } from '../lib/spin-service-stack'
import { getEnv } from '../lib/shared/utils'

const region = getEnv('REGION')
const accountId = getEnv('ACCOUNT_ID')

const app = new cdk.App()

const ACCOUNT = app.node.tryGetContext('ACCOUNT_ID')
const REGION = app.node.tryGetContext('REGION')
const PROXY_IP = app.node.tryGetContext('PROXY_IP')
const USER = app.node.tryGetContext('USER')
const DASHPASS = app.node.tryGetContext('DASHPASS')
const ZONE_NAME = app.node.tryGetContext('ZONE_NAME')
const ZONE_ID = app.node.tryGetContext('ZONE_ID')
const SES_PRIVATE_KEY = app.node.tryGetContext('SES_PRIVATE_KEY')
const SES_PUBLIC_KEY = app.node.tryGetContext('SES_PUBLIC_KEY')

if (validBuildParams()) {
  new SpinServiceStack(app, 'SpinServiceStack', {
    /* If you don't specify 'env', this stack will be environment-agnostic.
     * Account/Region-dependent features and context lookups will not work,
     * but a single synthesized template can be deployed anywhere. */
    /* Uncomment the next line to specialize this stack for the AWS Account
     * and Region that are implied by the current CLI configuration. */
    // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    /* Uncomment the next line if you know exactly what Account and Region you
     * want to deploy the stack to. */
    env: { account: accountId, region },
    /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
  })
}

function validBuildParams() {
  return [
    ACCOUNT,
    REGION,
    PROXY_IP,
    USER,
    DASHPASS,
    ZONE_NAME,
    ZONE_ID,
    SES_PRIVATE_KEY,
    SES_PUBLIC_KEY,
  ].every((value) => value !== undefined || null)
}
