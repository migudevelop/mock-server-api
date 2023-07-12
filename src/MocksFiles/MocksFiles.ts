import { basename, extname, resolve } from 'node:path'

import { readFileSync, readdirSync } from 'node:fs'
import type { LoggerInterface } from '../Logger/index.js'
import type { MocksPath } from './../MockServer/index.js'
import type {
  MocksFilesConstrunctor,
  MocksFilesConstrunctorArgs,
  Route,
  RouteResponse,
  Routes,
  RoutesObject
} from './MocksFiles.types.js'

const ENCODING_UTF8 = 'utf8'

export const MocksFiles: MocksFilesConstrunctor = class MocksFiles {
  private _mocksPath: MocksPath
  private _logger: LoggerInterface
  private _initialized = false
  private _routes: Routes = []

  constructor({ mocksPath, logger }: MocksFilesConstrunctorArgs) {
    this._logger = logger
    if (!this._isValidMocksPath(mocksPath)) {
      const errorMessage = `Mocks path can't be empty`
      this._logger.error(errorMessage)
      throw new Error(errorMessage)
    }
    this._mocksPath = resolve(process.cwd(), mocksPath)
  }

  get routes() {
    return this._routes
  }

  public async read() {
    await this._init()
    await this._readFiles()
  }

  private _init() {
    if (!this._initialized) {
      this._logger.info(`Reading files in the path ${this._mocksPath}...`)
      this._initialized = true
    }
  }

  private _isValidMocksPath(mocksPath: MocksPath) {
    return typeof mocksPath === 'string' && mocksPath.length !== 0
  }

  private _readFiles() {
    const files = readdirSync(this._mocksPath, {
      recursive: true,
      withFileTypes: true
    })
    for (const file of files) {
      if (!file.isDirectory()) {
        this._logger.info(`Found ${file.name} file`)
        this._extractData(file.name)
      }
    }
  }

  private async _extractData(fileName: string): Promise<void> {
    this._logger.info(`Reading ${fileName} file...`)
    const jsonData = (await this._readFile(
      resolve(this._mocksPath, fileName)
    )) as Route[]
    const requestType = basename(
      fileName,
      extname(fileName)
    ).toLocaleLowerCase()
    this._logger.info(`Adding ${requestType} request type...`)
    this._routes.push({ [requestType]: jsonData } as RoutesObject)
    this._logger.success(`${requestType} request type added`)
  }

  private async _readFile(path: string): Promise<Route[]> {
    const fileContent = await readFileSync(path, ENCODING_UTF8)
    const jsonData = JSON.parse(fileContent)
    const tranformedJsonData = this._transformJsonData(jsonData)
    this._logger.info(
      `Json data in ${basename(path)} file: ${JSON.stringify(
        tranformedJsonData,
        null,
        2
      )}`
    )
    return tranformedJsonData
  }

  private _transformJsonData(jsonData: Route[]): Route[] {
    return jsonData.map((data) => ({
      ...data,
      response: this._obtainedResponse(data.response as RouteResponse)
    }))
  }

  private _obtainedResponse(response: RouteResponse) {
    if (typeof response === 'string') {
      const fileContent = readFileSync(
        resolve(this._mocksPath, response),
        ENCODING_UTF8
      )
      return JSON.parse(fileContent)
    }
    return response
  }

  //TODO
  // private _beforeMiddleware(req, res, next) {
  //   this._logger.info('Before middleware triggered')
  //   next()
  // }

  // private _responseHandler(_req, _res, next) {
  //   this._logger.info('Obtaining data...')
  //   next()
  // }

  // private _afterMiddleware(_req, _res, next) {
  //   this._logger.info('Before middleware triggered')
  //   next()
  // }
}
