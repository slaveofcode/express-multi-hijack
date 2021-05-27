# Express Multi Hijack

Simply hijack or intercept your express response via middleware.

## Installation

> npm i express-multi-hijack

## How it works

This library works by overriding `res.end` function, still maintaining the original one once all of the "hijack" functions are executed.

So it is safe to use with Your own custom `res.end` implementation.

## Example


1. Simple Tracing Response Body
```js
const Express = require('express');
const { Hijack } = require('express-multi-hijack');

const app = Express()

app.use(Hijack({
  json: true,
  handler: (body, req, res, next) => {
    console.info('got response body', body) // { "foo": "bar" }
  }
}))

app.get('/bar', (req, res, next) => {
  res.json({
    bar: 'foo',
  })
})

app.get('/foo', (req, res, next) => {
  res.json({
    foo: 'bar',
  })
})

app.listen(8080)
```

Based on the example above, the hijack handler will print `{ "foo": "bar" }` on request to [localhost:8080/foo](http://localhost:8080/foo) and `{ "bar": "foo" }` when requesting to [localhost:8080/bar](http://localhost:8080/bar).

2. Intercept and Override Response Body

```js
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
  return res.json({ message: 'Today is a Great Day!' })
})

app.listen(8080)
```

The code above will change the response `message` from `'Today is a Great Day!'` to `'Today is the bad day'`

3. Multiple Hijack, early hijack function is the highest priority

```js
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

app.listen(8080)

The code above will intercept and change response for [localhost:8080/monday](http://localhost:8080/monday) to `{today: 'Moday', message: 'What a lazy day'}`, and [localhost:8080/friday](http://localhost:8080/friday) to `{message: 'What a wondeful day'}`
```


For more examples please visit [example](https://github.com/slaveofcode/express-multi-hijack/tree/master/example) directory.

## LICENSE
MIT