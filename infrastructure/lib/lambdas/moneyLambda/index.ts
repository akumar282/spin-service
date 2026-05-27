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
const TWENTY_MINUTES_IN_MS = 20 * 60 * 1000
const TARGET_CLUSTER_ARN =
  'arn:aws:ecs:us-west-2:739292628626:cluster/SpinCompute-prod-spinServiceCluster10A7212E-kY19A9of3vJe'

export async function handler(event: ScheduledEvent) {
  try {
    const tasks = await getRunningTaskArns()
    let killedTasks = 0

    if (!tasks) {
      return
    }

    const describeTasksOutput = await ecsClient.send(
      new DescribeTasksCommand({
        cluster: TARGET_CLUSTER_ARN,
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
          rightNow.getTime() - task.startedAt.getTime()
        )
        if (timeDuration > TWENTY_MINUTES_IN_MS) {
          const taskId = task.taskArn?.split('/').pop()
          if (!taskId) {
            continue
          }

          await ecsClient.send(
            new StopTaskCommand({
              cluster: TARGET_CLUSTER_ARN,
              task: taskId,
            })
          )
          killedTasks += 1
        }
      }
    }

    if (killedTasks > 0) {
      await sendMoneyMail(
        'Check console',
        `long running tasks stopped check console ${event.time}. stopped=${killedTasks}`
      )
    }
  } catch (e) {
    if (e instanceof AccessDeniedException) {
      await sendMoneyMail(
        'yo money gone',
        `Running tasks failed to stop check console ${event.time}`
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

async function getRunningTaskArns() {
  const taskArns: string[] = []
  let nextToken: string | undefined

  do {
    const listTasksOutput = await ecsClient.send(
      new ListTasksCommand({
        cluster: TARGET_CLUSTER_ARN,
        desiredStatus: 'RUNNING',
        nextToken,
      })
    )

    if (listTasksOutput.taskArns) {
      taskArns.push(...listTasksOutput.taskArns)
    }

    nextToken = listTasksOutput.nextToken
  } while (nextToken)

  return taskArns.length > 0 ? taskArns : undefined
}
