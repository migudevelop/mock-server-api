import { cosmiconfigSync } from 'cosmiconfig'
import type { CosmiconfigResult } from 'cosmiconfig/dist/types.js'
import { ConfigConstrunctor, InitArgs, ModuleName } from './Config.types.js'

const DEFAULT_CONFIGURATION = { config: {}, filepath: '' }

export const Config: ConfigConstrunctor = class Config {
  private _moduleName: ModuleName
  private _configuration: CosmiconfigResult

  constructor(moduleName: ModuleName) {
    this._moduleName = moduleName
    this._configuration = DEFAULT_CONFIGURATION
  }

  get getConfiguration(): CosmiconfigResult {
    return this._configuration
  }

  public init({ searchDir }: InitArgs = {}) {
    const configDir = searchDir || process.cwd()
    const options = {
      stopDir: configDir
    }
    const explorer = cosmiconfigSync(this._moduleName, options)
    const result = explorer.search(configDir)
    this._configuration = this._validateResult(result)
  }

  private _validateResult(result: CosmiconfigResult): CosmiconfigResult {
    return {
      config: result?.config || {},
      filepath: result?.filepath || '',
      isEmpty: result?.isEmpty
    }
  }
}
