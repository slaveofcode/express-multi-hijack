const Express = require('express')
const { Hijack } = require('../dist')

const app = Express()

app.use(Hijack({
  json: true,
  handler: (body, _, res) => {
    console.info('body:', body)
    res.json({ message: 'Today is the bad day' })
  }
}))

app.get('/', (_, res) => {
  return res.status(200).json({ message: 'Today is a Great Day!' })
})

console.info('Make a request to http://localhost:8080 to see the effect')

app.listen(8080)