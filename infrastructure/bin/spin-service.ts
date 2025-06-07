import * as cdk from 'aws-cdk-lib'
import { SpinServiceStack } from '../lib/spin-service-stack'
import { ComputingNetworkingStack } from '../lib/computing-networking-stack'
import { getEnv } from '../lib/shared/utils'

const app = new cdk.App()

const ACCOUNT = getEnv('ACCOUNT')
const REGION = getEnv('REGION')
const DISCOGS_TOKEN = getEnv('DISCOGS_TOKEN')
const ENV = getEnv('ENV')
const PROXY_IP = getEnv('PROXY_IP')
const USER = getEnv('USER')
const DASHPASS = getEnv('DASHPASS')
const ZONE_NAME = getEnv('ZONE_NAME')
const ZONE_ID = getEnv('ZONE_ID')
const SES_PRIVATE_KEY = getEnv('SES_PRIVATE_KEY')
const SES_PUBLIC_KEY = getEnv('SES_PUBLIC_KEY')

if (validBuildParams()) {
  const spinStack = new SpinServiceStack(app, `SpinServiceStack-${ENV}`, {
    opensearch_user: USER,
    dashpass: DASHPASS,
    env: { account: ACCOUNT, region: REGION },
  })
  new ComputingNetworkingStack(app, `SpinCompute-${ENV}`, {
    discogs_token: DISCOGS_TOKEN,
    proxy_ip: PROXY_IP,
    zone_name: ZONE_NAME,
    zone_id: ZONE_ID,
    ses_private_key: SES_PRIVATE_KEY,
    ses_public_key: SES_PUBLIC_KEY,
    api: spinStack.spinApi,
    vpc: spinStack.vpc,
    opensearch_user: USER,
    dashpass: DASHPASS,
    env: { account: ACCOUNT, region: REGION },
  })
}

function validBuildParams() {
  return [
    ACCOUNT,
    REGION,
    PROXY_IP,
    DISCOGS_TOKEN,
    USER,
    DASHPASS,
    ZONE_NAME,
    ZONE_ID,
    SES_PRIVATE_KEY,
    SES_PUBLIC_KEY,
    ENV,
  ].every((value) => value !== undefined || null)
}
