import { Stack } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import {
  Certificate,
  CertificateValidation,
} from 'aws-cdk-lib/aws-certificatemanager'
import { getEnv } from '../shared/utils'
import { CertificateStackProps } from './stackProps'
import { PublicHostedZone } from 'aws-cdk-lib/aws-route53'

export class CertificateStack extends Stack {
  public readonly certificate: Certificate
  public readonly zone: PublicHostedZone

  public constructor(
    scope: Construct,
    id: string,
    props: CertificateStackProps
  ) {
    super(scope, id, props)

    const env = getEnv('ENV')

    const publicZone = PublicHostedZone.fromHostedZoneAttributes(
      this,
      'ZoneSpin',
      {
        zoneName: props.zoneName,
        hostedZoneId: props.zoneId,
      }
    ) as PublicHostedZone

    this.zone = publicZone

    this.certificate = new Certificate(this, `ZoneCert-${env}`, {
      domainName: props.domainName,
      validation: CertificateValidation.fromDns(publicZone),
    })
  }
}
