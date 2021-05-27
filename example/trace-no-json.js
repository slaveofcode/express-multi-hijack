const Express = require('express')
const { Hijack } = require('../dist')

const app = Express()

// uncomment options below to see the error if `json: true`
app.use(Hijack({
  // json: true,
  handler: (body) => {
    console.info('body:', body)
  },
  // onJsonParseError: (err) => {
  //   console.log('error parse:', err.message)
  // }
}))

app.get('/', (_, res) => {
  return res.status(200).send('this message is on body')
})

console.info('Make a request to http://localhost:8080 to see the effect')

app.listen(8080)