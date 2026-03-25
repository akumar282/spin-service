import {
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEvent,
  APIGatewayProxyEventBase,
} from 'aws-lambda'
import { mockClient } from 'aws-sdk-client-mock'
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb'
import {
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { handler } from '../../../infrastructure/lib/lambdas/userLambda'
import 'aws-sdk-client-mock-jest'

describe('User Lambda handler', () => {
  const dynamoMock = mockClient(DynamoDBDocumentClient)
  const cognitoMock = mockClient(CognitoIdentityProviderClient)
  const OLD_ENV = process.env

  const makeEvent = (
    event: Partial<APIGatewayProxyEvent>
  ): APIGatewayProxyEvent =>
    <APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>>{
      body: null,
      headers: {},
      multiValueHeaders: {},
      httpMethod: 'GET',
      isBase64Encoded: false,
      path: '/user/{id}',
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      resource: '/user/{id}',
      requestContext: {
        authorizer: {
          principalId: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9',
        },
      },
      ...event,
    }

  beforeEach(() => {
    process.env = { ...OLD_ENV }
    process.env.TABLE_NAME = 'usersTable'
    process.env.USER_POOL_ID = 'pool-123'
    process.env.CLOUD_DISTRO = 'https://idk.com'

    dynamoMock.reset()
    cognitoMock.reset()
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  test('GET /user/{id} returns nested user data', async () => {
    const storedUser = {
      id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9',
      user_name: 'user@example.com',
      email: 'user@example.com',
      phone: '',
      notifyType: ['EMAIL'],
      genres: [{ genre: 'Jazz', value: 'Jazz' }],
      artists: [{ artist: 'PinkPantheress', value: 'PinkPantheress' }],
      labels: [{ label: 'XL', value: 'XL' }],
      albums: [],
      custom: ['wishlist'],
      countryCode: { iso: 'US', dial: '+1' },
    }

    dynamoMock.on(QueryCommand).resolves({ Items: [storedUser] })

    const result = await handler(
      makeEvent({
        httpMethod: 'GET',
        pathParameters: { id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9' },
        headers: { origin: 'https://idk.com' },
      })
    )

    expect(result.statusCode).toBe(200)
    expect(dynamoMock).toHaveReceivedCommand(QueryCommand)

    const body = JSON.parse(result.body)
    expect(body.data.genres).toEqual([
      { genre: 'Jazz', value: 'Jazz', type: 'genre' },
    ])
    expect(body.data.artists).toEqual([
      { artist: 'PinkPantheress', value: 'PinkPantheress', type: 'artist' },
    ])
    expect(body.data.labels).toEqual([
      { label: 'XL', value: 'XL', type: 'label' },
    ])
    expect(body.data.custom).toEqual([{ custom: 'wishlist', type: 'custom' }])
  })

  test('GET /user/{id} returns 404 when user is missing', async () => {
    dynamoMock.on(QueryCommand).resolves({})

    const result = await handler(
      makeEvent({
        httpMethod: 'GET',
        pathParameters: { id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9' },
        headers: { origin: 'https://idk.com' },
      })
    )

    expect(result.statusCode).toBe(404)
  })

  test('PATCH /user/{id} updates cognito and dynamo with transformed values', async () => {
    cognitoMock.on(AdminUpdateUserAttributesCommand).resolves({
      $metadata: { httpStatusCode: 200 },
    })

    dynamoMock.on(UpdateCommand).resolves({
      Attributes: { id: 'user-1' },
      $metadata: { httpStatusCode: 200 },
    })

    const patchBody = {
      id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9',
      user_name: 'user@example.com',
      email: 'user@example.com',
      phone: '4257372110',
      notifyType: ['EMAIL'],
      genres: [{ genre: 'Jazz', type: 'genre', value: 'Jazz' }],
      labels: [{ label: 'XL', type: 'label', value: 'XL' }],
      artists: [
        { artist: 'PinkPantheress', type: 'artist', value: 'PinkPantheress' },
      ],
      albums: [],
      custom: [{ custom: 'wishlist', type: 'custom', value: 'wishlist' }],
      countryCode: { iso: 'US', dial: '+1' },
    }

    const result = await handler(
      makeEvent({
        httpMethod: 'PATCH',
        pathParameters: { id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9' },
        headers: { origin: 'https://idk.com' },
        body: JSON.stringify(patchBody),
      })
    )

    expect(result.statusCode).toBe(200)
    expect(cognitoMock).toHaveReceivedCommand(AdminUpdateUserAttributesCommand)
    expect(dynamoMock).toHaveReceivedCommand(UpdateCommand)

    const cognitoInput = cognitoMock.commandCalls(
      AdminUpdateUserAttributesCommand
    )[0].args[0].input
    expect(cognitoInput).toEqual(
      expect.objectContaining({
        UserPoolId: 'pool-123',
        Username: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9',
        UserAttributes: [
          { Name: 'phone_number', Value: '+14257372110' },
          { Name: 'email', Value: 'user@example.com' },
        ],
      })
    )

    const updateInput = dynamoMock.commandCalls(UpdateCommand)[0].args[0].input
    expect(updateInput).toEqual(
      expect.objectContaining({
        TableName: 'usersTable',
        Key: {
          id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9',
          user_name: 'user@example.com',
        },
        ExpressionAttributeValues: expect.objectContaining({
          ':ge': [{ genre: 'Jazz', value: 'Jazz' }],
          ':la': [{ label: 'XL', value: 'XL' }],
          ':art': [{ artist: 'PinkPantheress', value: 'PinkPantheress' }],
          ':cus': ['wishlist'],
        }),
      })
    )
  })

  test('PATCH /user/{id} returns 500 when body is missing', async () => {
    const result = await handler(
      makeEvent({
        httpMethod: 'PATCH',
        pathParameters: { id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9' },
        headers: { origin: 'https://idk.com' },
        body: null,
      })
    )

    expect(result.statusCode).toBe(500)
    expect(JSON.parse(result.body)).toBe('Update Failed')
  })

  test('Returns 400 for unsupported method', async () => {
    const result = await handler(
      makeEvent({
        httpMethod: 'DELETE',
        pathParameters: { id: '48c113f0-5041-70db-7d2f-2cb7dbc5d0b9' },
        headers: { origin: 'https://idk.com' },
      })
    )

    expect(result.statusCode).toBe(400)
  })

  test('Returns 500 when path parameter is missing', async () => {
    const result = await handler(
      makeEvent({
        httpMethod: 'GET',
        pathParameters: null,
        headers: { origin: 'https://idk.com' },
      })
    )

    expect(result.statusCode).toBe(403)
  })
})
