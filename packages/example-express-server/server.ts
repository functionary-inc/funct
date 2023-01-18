import express from "express"
// calling directly into the package to have autoreload
// since this is only for dev it's fine
// import { tempdjskdufe33 } from "../node/lib"

const app = express()
const port = 3002

app.get('/', (req: any, res: any) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

