const Express = require('express')
const { Hijack } = require('../dist')

const app = Express()

app.use(Hijack({
  json: true,
  handler: (body) => {
    console.info('body:', body)
  }
}))

app.get('/', (_, res) => {
  return res.status(200).json({ message: 'this message is on body' })
})

console.info('Make a request to http://localhost:8080 to see the effect')

app.listen(8080)