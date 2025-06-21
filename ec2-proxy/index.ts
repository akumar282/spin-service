import express, { Request, Response } from 'express'
import { getEnv, requestWithBody } from './functions'

const app = express()
const port = 8080
const endpoint = getEnv('ENDPOINT')
// const endpoint = 'http://localhost:5432'


app.use(/(.*)/, async (req: Request, res: Response) => {
  if (!req.headers.authorization) {
    res.status(401).send({ message: 'Proxy: Unauthorized' })
  } else {
    try {
      const result = await requestWithBody(
        req.originalUrl,
        endpoint,
        req.body,
        req.method,
        req.headers.authorization
      )
      const data = await result.json()
      res.status(result.status).send(data)
    } catch (e) {
      res.status(400).send(e)
    }
  }
})


app.listen(port, () => {
  console.log(`Server started on ${port}`)
})
