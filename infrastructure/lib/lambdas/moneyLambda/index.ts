import { ScheduledEvent } from 'aws-lambda'
import {
  AccessDeniedException,
  DescribeTasksCommand,
  ECSClient,
  ListTasksCommand,
  StopTaskCommand,
} from '@aws-sdk/client-ecs'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'

const ecsClient = new ECSClient()
const sesClient = new SESClient()
const ONE_HOUR_IN_MS = 60 * 60 * 1000

export async function handler(event: ScheduledEvent) {
  try {
    const listTasksOutput = await ecsClient.send(
      new ListTasksCommand({
        desiredStatus: 'RUNNING',
      })
    )
    const tasks = listTasksOutput.taskArns

    if (!tasks) {
      return
    }

    const describeTasksOutput = await ecsClient.send(
      new DescribeTasksCommand({
        tasks,
      })
    )

    const taskData = describeTasksOutput.tasks
    if (!taskData) {
      return
    }

    for (const task of taskData) {
      if (task.startedAt) {
        const rightNow = new Date()
        const timeDuration = Math.abs(
          rightNow.getDate() - task.startedAt.getDate()
        )
        if (timeDuration > ONE_HOUR_IN_MS) {
          const taskId = task.taskArn?.split('/').pop()
          if (!taskId) {
            continue
          }

          await ecsClient.send(
            new StopTaskCommand({
              task: taskId,
            })
          )
        }
      }
    }

    await sendMoneyMail(
      'Check console',
      'long running tasks stopped check console'
    )
  } catch (e) {
    if (e instanceof AccessDeniedException) {
      await sendMoneyMail(
        'yo money gone',
        'Running tasks failed to stop check console'
      )
    }
  }
}

async function sendMoneyMail(topic: string, body: string) {
  await sesClient.send(
    new SendEmailCommand({
      Destination: {
        ToAddresses: ['actuallychowmein@gmail.com'],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: body,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: topic,
        },
      },
      Source: '"money man" <money@spinmyrecords.com>',
    })
  )
}
