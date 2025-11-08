import { ResponseBuilder } from '../../infrastructure/lib/apigateway/response'

describe('Response test', () => {
  test('test generation', async () => {
    const response = new ResponseBuilder({ data: 'hello' })
      .addCors('https://localhost:5173')
      .addHeaders({ 'Content-type': 'application/json' })
      .addHeaders({ 'Access-Control-Allow-Credentials': 'true' }).response
    console.log(response)
    expect(response).toHaveProperty('headers')
  })
})
