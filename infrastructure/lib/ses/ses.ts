import { Construct } from 'constructs'
import {
  aws_route53 as route53,
  aws_ses as ses,
  SecretValue,
} from 'aws-cdk-lib'
import { Identity } from 'aws-cdk-lib/aws-ses'
import { getEnv } from '../shared/utils'

export interface SESConstructProps {
  existingHostedZone: {
    hostedZoneId: string
    zoneName: string
  }
  privateKey: SecretValue
  publicKey?: string
}

export class SESConstruct {
  public hostedZone: route53.IHostedZone

  constructor(scope: Construct, id: string, props: SESConstructProps) {
    this.hostedZone = route53.PublicHostedZone.fromHostedZoneId(
      scope,
      props.existingHostedZone.zoneName,
      props.existingHostedZone.hostedZoneId
    )

    new ses.EmailIdentity(scope, 'Identity', {
      identity: Identity.publicHostedZone(this.hostedZone),
      dkimIdentity: ses.DkimIdentity.byoDkim({
        privateKey: props.privateKey,
        publicKey: props.publicKey,
        selector: 'spin',
      }),
    })
  }
}
