import { NotifyTypes, Records, User } from '../../apigateway/types'
import {
  SendEmailCommand,
  SendEmailCommandInput,
  SendEmailCommandOutput,
  SESClient,
} from '@aws-sdk/client-ses'

export async function sendEmail(
  client: SESClient,
  destination: User[],
  item: Records
): Promise<SendEmailCommandOutput> {
  console.log(destination)
  const link = item.content ? item.content : item.link
  const input: SendEmailCommandInput = {
    Destination: {
      ToAddresses: ['actuallychowmein@gmail.com'],
      BccAddresses: destination.map((user) => user.email),
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `The record, ${item.album} by ${item.artist} is now available. 
                 Get it now:  <a class="ulink" href="${link}" target="_blank">
                 Record Store Link</a>.`,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: `You liked this record: ${item.album} - ${item.artist} is in stock.`,
      },
    },
    Source: '"spin-service" <notifications@spinmyrecords.com>',
  }
  const command = new SendEmailCommand(input)
  return await client.send(command)
}

export function determineNotificationMethods(users: User[]) {
  const email: User[] = []
  const phone: User[] = []
  const inapp: User[] = []

  for (const user of users) {
    if (user.notifyType.includes(NotifyTypes.EMAIL) && user.email) {
      email.push(user)
    }
    if (user.notifyType.includes(NotifyTypes.TEXT) && user.phone) {
      phone.push(user)
    }
    if (user.notifyType.includes(NotifyTypes.PUSH)) {
      inapp.push(user)
    }
  }
  return {
    email,
    phone,
    inapp,
  }
}
