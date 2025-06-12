import express, { Request, Response } from 'express'

const app = express()
const port = 8080



app.use(/(.*)/, (req: Request, res: Response) => {
  const auth = req.headers.authorization
  res.send(`Hello ${req.method}, ${req.originalUrl}, ${req.host}`)
})


app.listen(port, () => {
  console.log(`Server started on ${port}`)
})
