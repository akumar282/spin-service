import express, { Request, Response } from 'express'

const app = express()
const port = 8080



app.use(/(.*)/, (req: Request, res: Response) => {
  console.log("catch all")
  console.log(req.path)
  res.send(`Hello ${req.path}`)
})

app.get('/', (req: Request, res: Response) => {
  res.send('<!DOCTYPE html>\n' +
    '<html>\n' +
    '<body>\n' +
    '\n' +
    '<h1>My First Heading</h1>\n' +
    '\n' +
    '<p>My first paragraph.</p>\n' +
    '\n' +
    '</body>\n' +
    '</html>')
})

app.listen(port, () => {
  console.log(`Server started on ${port}`)
})
