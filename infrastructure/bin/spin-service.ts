import * as cdk from 'aws-cdk-lib'
import { SpinServiceStack } from '../lib/stacks/spin-service-stack'
import { ComputingNetworkingStack } from '../lib/stacks/computing-networking-stack'
import { getEnv } from '../lib/shared/utils'
import { SpinClientStack } from '../lib/stacks/spin-client-stack'
import { CertificateStack } from '../lib/stacks/certificate-stack'

const app = new cdk.App()

const ACCOUNT = getEnv('ACCOUNT')
const REGION = getEnv('REGION')
const DISCOGS_TOKEN = getEnv('DISCOGS_TOKEN')
const DISCOGS_SECRET = getEnv('DISCOGS_SECRET')
const DISCOGS_KEY = getEnv('DISCOGS_KEY')
const ENV = getEnv('ENV')
const PROXY_IP = getEnv('PROXY_IP')
const USER = getEnv('USER')
const DASHPASS = getEnv('DASHPASS')
const ZONE_NAME = getEnv('ZONE_NAME')
const ZONE_ID = getEnv('ZONE_ID')
const SES_PRIVATE_KEY = getEnv('SES_PRIVATE_KEY')
const SES_PUBLIC_KEY = getEnv('SES_PUBLIC_KEY')
const SSH_IP = getEnv('SSH_IP')
const OPEN_AI_KEY = getEnv('OPEN_AI_KEY')
const OPEN_AI_ORG_ID = getEnv('OPEN_AI_ORG_ID')

/**
 * certificateStack === https://github.com/aws/aws-cdk/issues/25343
 * computeStack === networking & compute + api declaration
 * spinStack === business logic lambdas & client used resources + api definition
 * spinClientStack === web interface
 */

if (validBuildParams()) {
  const env = { account: ACCOUNT, region: REGION }

  const domain = 'spinmyrecords.com'

  const sub = {
    dev: `dev.${domain}`,
    prod: `www.${domain}`,
  }

  const subDomain = ENV === 'prod' ? sub.prod : sub.dev

  const certificateStack = new CertificateStack(
    app,
    `CertificateStack-${ENV}`,
    {
      env: {
        account: ACCOUNT,
        region: 'us-east-1',
      },
      domainName: subDomain,
      crossRegionReferences: true,
      zoneId: ZONE_ID,
      zoneName: ZONE_NAME,
    }
  )

  const spinClient = new SpinClientStack(app, `SpinClientStack-${ENV}`, {
    env,
    certificate: certificateStack.certificate,
    crossRegionReferences: true,
    sub: subDomain,
    zone: certificateStack.zone,
  })

  const computeStack = new ComputingNetworkingStack(app, `SpinCompute-${ENV}`, {
    discogs_token: DISCOGS_TOKEN,
    proxy_ip: PROXY_IP,
    zone_name: ZONE_NAME,
    zone_id: ZONE_ID,
    ses_private_key: SES_PRIVATE_KEY,
    ses_public_key: SES_PUBLIC_KEY,
    ssh_ip: SSH_IP,
    opensearch_user: USER,
    dashpass: DASHPASS,
    open_ai_org: OPEN_AI_ORG_ID,
    open_ai_key: OPEN_AI_KEY,
    env,
  })

  const spinStack = new SpinServiceStack(app, `SpinServiceStack-${ENV}`, {
    discogs_key: DISCOGS_KEY,
    discogs_secret: DISCOGS_SECRET,
    opensearch_user: USER,
    domainEndpoint: computeStack.domainEndpoint,
    vpc: computeStack.vpc,
    dashpass: DASHPASS,
    env,
    certificate: certificateStack.certificate,
    zone: certificateStack.zone,
    crossRegionReferences: true,
  })
}

function validBuildParams() {
  return [
    ACCOUNT,
    REGION,
    PROXY_IP,
    DISCOGS_TOKEN,
    DISCOGS_KEY,
    DISCOGS_SECRET,
    USER,
    DASHPASS,
    ZONE_NAME,
    ZONE_ID,
    SES_PRIVATE_KEY,
    SES_PUBLIC_KEY,
    ENV,
    OPEN_AI_KEY,
    OPEN_AI_ORG_ID,
  ].every((value) => value !== undefined || null)
}
