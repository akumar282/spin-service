import express, { Request, Response } from 'express'

const app = express()
const port = 3000

app.listen(port, () => {
  console.log('Jabhi')
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
