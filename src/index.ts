import { Request, Response, NextFunction } from 'express'
import { nanoid } from 'nanoid'

interface IHijackConfig {
  json?: boolean
  onJsonParseError?: (err: Error) => void | any
  handler: (responseBody: any, req: Request, res: Response, next: NextFunction) => void | any
}

const Hijack = (config: IHijackConfig) => {
  if (config.onJsonParseError && typeof config.onJsonParseError !== 'function') {
    throw new TypeError('"onJsonParseError" must be a function!')
  }

  // @ts-ignore
  const middleware = Middleware(config)
  return middleware
}

const Middleware = (config: IHijackConfig) => (req: Request, res: Response, next: NextFunction) => {
  const defWrite = res.write
  const defEnd = res.end
  const chunks: any[] = []
  const uniqKeyHijack = '__multi_hijack_' + nanoid()

  const nextFn: any = next

  res.write = (...args: any[]) => {
    chunks.push(Buffer.from(args[0]))
    return defWrite.apply(res, [args[0], args[1], args[2]])
  }

  res.end = (...args: any[]) => {
    // if (args[0] && chunks.length > 0) {
    //   chunks = [] // reset
    // }

    if (args[0]) {
      chunks.push(Buffer.from(args[0]))
    }

    const body = Buffer.concat(chunks).toString('utf8')

    let responseBody = body

    if (config.json) {
      try {
        responseBody = JSON.parse(body)
      } catch (err) {
        if (config.onJsonParseError) {
          config.onJsonParseError(err)
        }
      }
    }

    if (!(req as any)[uniqKeyHijack]) {
      (req as any)[uniqKeyHijack] = true
      // if not return any value from function
      // or not calling response inside the function
      // will continue to the original end (defEnd)
      const isOverride = config.handler(responseBody, req, res, next)
      if (!isOverride) {
        defEnd.apply(res, [args[0], args[1], args[2]])
      }
    } else {
      defEnd.apply(res, [args[0], args[1], args[2]])
    }
  }

  return nextFn()
}

export {
  Hijack,
}
