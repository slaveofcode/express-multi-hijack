const Express = require('express')
const { Hijack } = require('../dist')

const app = Express()

// hijack on monday
app.use(Hijack({
  json: true,
  handler: (body, _, res) => {
    if (body.today === 'Monday') {
      res.json({
        ...body,
        message: 'What a lazy day'
      })
    }
  }
}))

// hijack on friday
app.use(Hijack({
  json: true,
  handler: (body, req, res) => {
    if (req.path === '/friday') {
      res.json({
        ...body,
        message: 'What a wondeful day'
      })
    }
  }
}))

app.get('/', (_, res) => res.json({ message: 'No Hijack' }))

app.get('/monday', (_, res) => {
  return res.status(200).json({ today: 'Monday', message: 'Today is a Great Day!' })
})

app.get('/friday', (_, res) => {
  return res.status(200).json({ message: 'Today is a Great Day!' })
})

console.info('Make a request to http://localhost:8080/monday and http://localhost:8080/friday to see the effect')

app.listen(8080)