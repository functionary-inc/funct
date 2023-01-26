import express from 'express'
import cors from 'cors'
// calling directly into the package to have autoreload
// since this is only for dev it's fine
import { Functionary } from '../node/lib'
import { FunctionaryEntity } from '@funct/core'

const app = express()
const port = 3002
app.use(cors())

const funct = new Functionary({ debug: true, baseURL: 'https://dev-slack-crm.localsymphony.io/api/v1' })

funct.setApiKey('SOME_API_KEY')
let test = 0

app.get('/', (req: any, res: any) => {
  funct.identify(
    { model: 'customer', ids: [2234343, 'new-ids', test], properties: { counter: test } },
    { setToContext: false },
  )
  test++

  console.log(test)
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`NODE SERVER on http://127.0.0.1:${port}/`)
})
