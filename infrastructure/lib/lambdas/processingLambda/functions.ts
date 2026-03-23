import {
  SendMessageCommand,
  SendMessageCommandOutput,
  SQSClient,
} from '@aws-sdk/client-sqs'

export function createQuery(
  artist: string,
  album: string,
  media: string,
  title: string,
  genres: string[]
) {
  const shouldList = []

  shouldList.push({
    nested: {
      path: 'albums',
      query: {
        bool: {
          filter: [{ term: { 'albums.type': media } }],
          must: [
            {
              bool: {
                should: [
                  {
                    match_phrase: {
                      'albums.album': {
                        query: `${artist} - ${album}`,
                        slop: 2,
                        boost: 6,
                      },
                    },
                  },
                  {
                    match: {
                      'albums.album': {
                        query: `${artist} - ${album}`,
                        fuzziness: 'AUTO',
                        prefix_length: 2,
                        max_expansions: 50,
                        minimum_should_match: '3<75%',
                        boost: 2,
                      },
                    },
                  },
                ],
                minimum_should_match: 1,
              },
            },
          ],
        },
      },
    },
  })

  shouldList.push({
    nested: {
      path: 'artists',
      query: {
        match: {
          'artists.artist': {
            query: artist,
            fuzziness: 'AUTO',
            prefix_length: 1,
          },
        },
      },
    },
  })

  shouldList.push({
    match: {
      custom: {
        query: title,
        fuzziness: 'AUTO',
        minimum_should_match: '2<75%',
      },
    },
  })

  if (genres && genres.length > 0) {
    for (const genre of genres) {
      shouldList.push({ term: { genres: genre } })
    }
  }

  return {
    query: {
      bool: {
        should: shouldList,
        minimum_should_match: 1,
      },
    },
  }
}

export async function sendSQSMessage(
  payload: object,
  client: SQSClient,
  queueUrl: string
): Promise<SendMessageCommandOutput> {
  const command = new SendMessageCommand({
    QueueUrl: queueUrl,
    MessageBody: JSON.stringify(payload),
  })
  return await client.send(command)
}
