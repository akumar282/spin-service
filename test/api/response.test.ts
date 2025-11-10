import { ResponseBuilder } from '../../infrastructure/lib/apigateway/response'

describe('Response test', () => {
  test('test generation', async () => {
    const response = new ResponseBuilder({ data: 'hello' })
      .addCors('https://localhost:5173')
      .addCors('https://localhost:5173')
      .addHeaders({ 'Content-type': 'application/json' })
      .addHeaders({ 'Access-Control-Allow-Credentials': 'true' })
      .addStatus(500)
      .addCookies([])
      .build()
    console.log(response)
    expect(response).toHaveProperty('multiValueHeaders')
  })
})
