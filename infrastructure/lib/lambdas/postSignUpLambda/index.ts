import { PostConfirmationTriggerEvent } from 'aws-lambda'
import {
  SendEmailCommand,
  SendEmailCommandInput,
  SESClient,
} from '@aws-sdk/client-ses'

const ses = new SESClient({})

export async function handler(event: PostConfirmationTriggerEvent) {
  if (event.triggerSource === 'PostConfirmation_ConfirmSignUp') {
    const attributes = event.request.userAttributes
    const email = attributes.email
    if (email) {
      try {
        const input: SendEmailCommandInput = {
          Destination: {
            ToAddresses: [email],
          },
          Message: {
            Body: {
              Html: {
                Charset: 'UTF-8',
                Data: `Welcome to spin-service! Your account has been created. 
                 Get started and set your notifications now: 
                 <a class="ulink" href="https://www.spinmyrecords.com/home" target="_blank">Spin Service</a>.`,
              },
            },
            Subject: {
              Charset: 'UTF-8',
              Data: 'Welcome to spin-service! Account Created!',
            },
          },
          Source:
            '"spin-service (SpinMyRecords.com)" <notifications@spinmyrecords.com>',
        }
        const command = new SendEmailCommand(input)
        await ses.send(command)
        console.log('Email sent')
      } catch (e) {
        console.log('Failed with:', e)
      }
    }
  }
  return event
}
