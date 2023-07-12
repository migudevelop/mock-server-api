import express, { Express, Router } from 'express'
import { Logger, LoggerInterface } from '../Logger/index.js'
import {
  ApiUrlName,
  Port,
  ServerConstructor,
  ServerConstructorArgs
} from './Server.types.js'

const DEFAULT_API_URL_NAME = '/api'
const DEFAULT_PORT = '3005'
const DEFAULT_LOGGER_NAME = 'server-logger'

export const Server: ServerConstructor = class Server {
  private readonly _apiUrlName: ApiUrlName
  private readonly _port: Port
  private readonly _app: Express
  private _logger: LoggerInterface

  constructor({ config, logger }: ServerConstructorArgs) {
    const { loggerName, port, apiUrlName } = config
    this._logger =
      logger || new Logger({ name: loggerName || DEFAULT_LOGGER_NAME })
    this._apiUrlName = apiUrlName || DEFAULT_API_URL_NAME
    this._port = port ?? DEFAULT_PORT
    this._app = express()
    this._initApp()
    this._logger.info(`apiUrlName: ${this._apiUrlName}`)
    this._logger.info(`port: ${this._port}`)
  }

  get getServerApp(): Express {
    return this._app
  }

  public async addRoutesGroup(router: Router): Promise<Express> {
    const routes = router.stack.map(({ route }) => {
      const methods = Object.keys(route.methods || {})
        .map((key) => key.toLocaleUpperCase())
        .join(',')
      return `${methods}: ${this._apiUrlName}${route.path}`
    })
    if (this._isEmptyRoutes(routes)) {
      const error = "Routes can't be empty"
      this._logger.error(error)
      throw new Error(error)
    }
    this._logger.info(
      `New routes are added: ${JSON.stringify(routes, null, 2)}`
    )
    return this._app.use(this._apiUrlName, router)
  }

  public async listen(): Promise<any> {
    this._logger.info(`Server connecting by the port ${this._port}...`)
    return await this._app.listen(this._port, () =>
      this._logger.success(`Conected in port: ${this._port}`)
    )
  }

  private _isEmptyRoutes(routes: string[]): boolean {
    return routes === null || routes === undefined || routes.length === 0
  }

  private _initApp() {
    this._app.use(express.urlencoded({ extended: false }))
    this._app.use(express.json())
    // Configure headers and CORS
    this._app.use((_req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*')
      res.header(
        'Access-Control-Allow-Headers',
        'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method'
      )
      res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, DELETE'
      )
      res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE')
      next()
    })
  }
}
