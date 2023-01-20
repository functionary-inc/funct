import express from 'express'
import cors from 'cors'
// calling directly into the package to have autoreload
// since this is only for dev it's fine
// import { tempdjskdufe33 } from "../node/lib"

const app = express()
const port = 3002
app.use(cors())
app.get('/', (req: any, res: any) => {
  console.log('I WAS HIT')
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`NODE SERVER on http://127.0.0.1:${port}/`)
})
