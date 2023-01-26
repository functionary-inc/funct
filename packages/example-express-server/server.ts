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

funct.setApiKey('func_7eb13d72d0b63403cbbc595b8287e0dee5cd5c4ee5ccdead')
let test = 0

app.get('/identify', (req: any, res: any) => {
  funct.identify(
    { model: 'customer', ids: [2234343, 'new-ids'], properties: { counter: test } },
    { setToContext: false },
  )
  test++

  res.send('Hello World!')
})

app.get('/assign', (req: any, res: any) => {
  funct.identify(
    { model: 'organization', ids: [2234343, 'new-ids'], properties: { counter: test } },
    { setToContext: false },
  )

  funct.assign({ model: 'customer', ids: [2234343, 'new-ids'] }, { model: 'organization', ids: [2234343, 'new-ids'] })
  test++

  res.send('Hello World!')
})

app.get('/event', (req: any, res: any) => {
  funct.event({ name: 'test_event' }, { model: 'customer', ids: [2234343, 'new-ids'] })

  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`NODE SERVER on http://127.0.0.1:${port}/`)
})
