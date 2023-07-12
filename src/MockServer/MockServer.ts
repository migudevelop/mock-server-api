import { Request, Response, Router } from 'express'
import {
  Config,
  type ConfigurationInterface,
  type ModuleName
} from '../Config/index.js'
import { Logger, LoggerInterface } from '../Logger/index.js'
import { MocksFiles, MocksFilesInterface, Route } from '../MocksFiles/index.js'
import {
  Server,
  ServerConfiguration,
  ServerInterface
} from '../Server/index.js'
import {
  MockServerConfiguration,
  MockServerConstrunctor,
  RequestType
} from './MockServer.types.js'

const DEFAULT_LOGGER_NAME = 'mock-server'

export const MockServer: MockServerConstrunctor = class MockServer {
  private _configuration: ConfigurationInterface
  private _server: ServerInterface
  private _logger: LoggerInterface
  private _mockFiles: MocksFilesInterface
  private _initialized = false

  constructor(moduleName: ModuleName) {
    this._init(moduleName)
  }

  public async run() {
    await this._readDb()
    await this._addRoutesInServer()
    await this._server.listen()
  }

  private async _init(moduleName: ModuleName) {
    if (!this._initialized) {
      this._logger = new Logger({
        name: moduleName
      })
      this._logger.info(`Init MockServer...`)
      this._logger.info(
        `Searching config file with modulename ${moduleName}...`
      )
      this._configuration = new Config(moduleName)
      this._configuration.init()
      const config = this._configuration?.getConfiguration
        ?.config as ServerConfiguration
      this._checkLoggerConfig(config, moduleName)
      this._server = new Server({
        config,
        logger: this._logger
      })
      this._initialized = true
    }
  }

  private _checkLoggerConfig(
    { loggerName, loggerType }: ServerConfiguration,
    moduleName: ModuleName
  ) {
    const newLoggerName = loggerName || `${moduleName}-${DEFAULT_LOGGER_NAME}`
    this._logger.info(`Change logger name to ${newLoggerName} type...`)
    this._logger.setName = newLoggerName
    if (loggerType != null && loggerType?.length !== 0) {
      this._logger.info(`Change logger type to ${loggerType} type...`)
      this._logger.setShowType = loggerType
    }
  }

  private async _readDb() {
    const { mocksPath } = this._configuration.getConfiguration
      ?.config as MockServerConfiguration
    this._mockFiles = new MocksFiles({ mocksPath, logger: this._logger })
    await this._mockFiles.read()
  }

  private async _addRoutesInServer() {
    const jsonRoutes = this._mockFiles.routes
    this._logger.info(
      `The following routes will be added: ${JSON.stringify(
        jsonRoutes,
        null,
        2
      )}`
    )
    this._logger.info('Creating Router...')
    const router = Router()
    this._mockFiles.routes.map((routesType) => {
      for (const routeType in routesType) {
        const routes = routesType[routeType]
        this._logger.info(`Adding ${routeType} routes...`)
        routes.forEach((route) => {
          this._createRequest(router, route, routeType as RequestType)
        })
      }
    })
    await this._server.addRoutesGroup(router)
  }

  private _createRequest(
    router: Router,
    requestRoute: Route,
    requestType: RequestType
  ) {
    const { route, response } = requestRoute
    this._logger.success(
      `Adding ${route} with response: ${JSON.stringify(response)}`
    )
    this._logger.success(
      `Route ${route} was added with response: ${JSON.stringify(response)}`
    )
    switch (requestType) {
      case 'get':
        return router.get(route as string, (_req, res) =>
          this._responseCallback(_req, res, requestRoute)
        )
      case 'post':
        return router.post(route as string, (_req, res) =>
          this._responseCallback(_req, res, requestRoute)
        )
      case 'delete':
        return router.delete(route as string, (_req, res) =>
          this._responseCallback(_req, res, requestRoute)
        )
      case 'put':
        return router.put(route as string, (_req, res) =>
          this._responseCallback(_req, res, requestRoute)
        )
    }
  }

  private _responseCallback(
    { baseUrl, hostname, method, url }: Request,
    res: Response,
    { responseCode, response }: Route
  ) {
    this._logger.success(
      JSON.stringify({ hostname, baseUrl, url, method, response }, null, 2)
    )
    res.status(responseCode || 200).send(response)
  }
}
