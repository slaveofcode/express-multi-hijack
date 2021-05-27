import Express from 'express'
import Supertest from 'supertest'
import { Hijack } from './index'

test('Hijack should be able to process response body', async () => {
  const app = Express()

  const fnCall = jest.fn()

  app.use(Hijack({ json: true, handler: (body, _req, _res, _next) => {
    fnCall(body)
  }}))


  app.get('/foo-bar', (_, res) => {
    return res.status(200).json({ message: 'foobar' })
  })

  const api = Supertest(app)

  const resp = await api.get('/foo-bar')

  expect(resp.status).toEqual(200)
  expect(resp.body).toEqual({
    message: 'foobar',
  })
  expect(fnCall).toHaveBeenCalledWith({
    message: 'foobar',
  })
})

test('Hijack should be able to override response body', async () => {
  const app = Express()

  app.use(Hijack({ json: true, handler: (_body, _req, res, _next) => {
    return res.json({ message: 'overrided message' })
  }}))

  app.get('/foo-bar', (_, res) => {
    return res.json({ message: 'foobar' })
  })

  const api = Supertest(app)

  const resp = await api.get('/foo-bar')

  expect(resp.status).toEqual(200)
  expect(resp.body).toEqual({
    message: 'overrided message',
  })
})

test('Hijack should be able to override response body with multiple hijack bottom up', async () => {
  const app = Express()

  app.use(Hijack({ json: true, handler: (_body, _req, res, _next) => {
    return res.json({ message: 'overrided message 2' })
  }}))

  app.use(Hijack({ json: true, handler: (_body, _req, res, _next) => {
    return res.json({ message: 'overrided message 1' })
  }}))

  app.get('/foo-bar', (_, res) => {
    return res.json({ message: 'foobar' })
  })

  const api = Supertest(app)

  const resp = await api.get('/foo-bar')

  expect(resp.status).toEqual(200)
  expect(resp.body).toEqual({
    message: 'overrided message 2',
  })
})

test('Hijack should be able to override for non JSON response with error', async () => {
  const app = Express()

  const errFunCall = jest.fn()

  app.use(Hijack({
    json: true,
    handler: (_body, _req, res, _next) => {
      return res.status(200).send('overrided message').end()
    },
    onJsonParseError: errFunCall,
  }))

  app.get('/foo-bar', (_, res) => {
    return res.json({ message: 'foobar' })
  })

  const api = Supertest(app)

  const resp = await api.get('/foo-bar').responseType('blob')

  expect(resp.status).toEqual(200)
  expect(Buffer.from(resp.body).toString('utf8')).toEqual('overrided message')
  expect(errFunCall).toHaveBeenCalled()
})

test('Hijack should be able to override for non JSON response without error', async () => {
  const app = Express()

  const errFunNoCall = jest.fn()

  app.use(Hijack({
    handler: (_body, _req, res, _next) => {
      return res.status(200).send('overrided message').end()
    },
    onJsonParseError: errFunNoCall,
  }))

  app.get('/foo-bar', (_, res) => {
    return res.json({ message: 'foobar' })
  })

  const api = Supertest(app)

  const resp = await api.get('/foo-bar').responseType('blob')

  expect(resp.status).toEqual(200)
  expect(Buffer.from(resp.body).toString('utf8')).toEqual('overrided message')
  expect(errFunNoCall).not.toHaveBeenCalled()
})
