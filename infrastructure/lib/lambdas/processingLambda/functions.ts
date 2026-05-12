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
  const releaseQuery = `${artist} - ${album}`

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
                        query: releaseQuery,
                        slop: 2,
                        boost: 6,
                      },
                    },
                  },
                  {
                    match: {
                      'albums.album': {
                        query: releaseQuery,
                        fuzziness: 'AUTO',
                        prefix_length: 2,
                        max_expansions: 20,
                        minimum_should_match: '2<100% 5<85%',
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
        bool: {
          should: [
            {
              match_phrase: {
                'artists.artist': {
                  query: artist,
                  slop: 1,
                  boost: 4,
                },
              },
            },
            {
              match: {
                'artists.artist': {
                  query: artist,
                  fuzziness: 'AUTO',
                  prefix_length: 2,
                  max_expansions: 20,
                  minimum_should_match: '100%',
                  boost: 1,
                },
              },
            },
          ],
          minimum_should_match: 1,
        },
      },
    },
  })

  shouldList.push({
    bool: {
      should: [
        {
          match_phrase: {
            custom: {
              query: title,
              slop: 2,
              boost: 5,
            },
          },
        },
        {
          match: {
            custom: {
              query: title,
              fuzziness: 'AUTO',
              prefix_length: 2,
              max_expansions: 20,
              minimum_should_match: '2<100% 5<85%',
              boost: 1,
            },
          },
        },
      ],
      minimum_should_match: 1,
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
