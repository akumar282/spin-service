import * as cdk from 'aws-cdk-lib'
import { SpinServiceStack } from '../lib/spin-service-stack'
import { getEnv } from '../lib/shared/utils'

const region = getEnv('REGION')
const accountId = getEnv('ACCOUNT_ID')

const app = new cdk.App()

const ACCOUNT = app.node.tryGetContext('ACCOUNT_ID')
const REGION = app.node.tryGetContext('REGION')
const DISCOGS_TOKEN = app.node.tryGetContext('DISCOGS_TOKEN')
const PROXY_IP = app.node.tryGetContext('PROXY_IP')
const USER = app.node.tryGetContext('USER')
const DASHPASS = app.node.tryGetContext('DASHPASS')
const ZONE_NAME = app.node.tryGetContext('ZONE_NAME')
const ZONE_ID = app.node.tryGetContext('ZONE_ID')
const SES_PRIVATE_KEY = app.node.tryGetContext('SES_PRIVATE_KEY')
const SES_PUBLIC_KEY = app.node.tryGetContext('SES_PUBLIC_KEY')

if (validBuildParams()) {
  new SpinServiceStack(app, 'SpinServiceStack', {
    discogs_token: DISCOGS_TOKEN,
    proxy_ip: PROXY_IP,
    opensearch_user: USER,
    dashpass: DASHPASS,
    zone_name: ZONE_NAME,
    zone_id: ZONE_ID,
    ses_private_key: SES_PRIVATE_KEY,
    ses_public_key: SES_PUBLIC_KEY,
    env: { account: accountId, region },
    /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
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
  ].every((value) => value !== undefined || null)
}
